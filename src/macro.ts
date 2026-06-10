// World Bank + FRED clients.
// World Bank: https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-api-basic-call-structures
// FRED: https://fred.stlouisfed.org/docs/api/fred/

import { KvCache, stableKey } from "./cache";

export interface MacroEnv {
  CACHE: KVNamespace;
  WORLDBANK_BASE: string;
  FRED_BASE: string;
  FRED_API_KEY?: string;
}

export interface IndicatorPoint {
  country: string;
  countryCode: string;
  indicator: string;
  indicatorName?: string;
  date: string;        // YYYY
  value: number | null;
}

export interface FredObservation {
  date: string;        // YYYY-MM-DD
  value: number | null;
}

// Country name → ISO 3166-1 alpha-3. Minimal table; falls back to the input.
const COUNTRY_NAME_TO_ISO3: Record<string, string> = {
  "United States": "USA", "US": "USA", "USA": "USA",
  "India": "IND", "IN": "IND",
  "China": "CHN", "CN": "CHN",
  "Japan": "JPN", "JP": "JPN",
  "Germany": "DEU", "DE": "DEU",
  "United Kingdom": "GBR", "UK": "GBR", "GB": "GBR",
  "France": "FRA", "FR": "FRA",
  "Brazil": "BRA", "BR": "BRA",
  "Russia": "RUS", "RU": "RUS",
  "Indonesia": "IDN", "ID": "IDN",
};

export class MacroClient {
  private cache: KvCache;
  constructor(private env: MacroEnv) { this.cache = new KvCache(env.CACHE, "macro"); }

  toIso3(country: string): string {
    const k = country.trim();
    return COUNTRY_NAME_TO_ISO3[k] ?? COUNTRY_NAME_TO_ISO3[k.toUpperCase()] ?? k.toUpperCase();
  }

  /** World Bank indicator timeseries. */
  async wbIndicator(opts: { country: string; indicator: string; yearFrom?: number; yearTo?: number }): Promise<IndicatorPoint[]> {
    const iso = this.toIso3(opts.country);
    const range = opts.yearFrom && opts.yearTo ? `&date=${opts.yearFrom}:${opts.yearTo}` : "";
    const key = `wb:${iso}:${opts.indicator}:${opts.yearFrom ?? ""}:${opts.yearTo ?? ""}`;
    return this.cache.memoize(key, 60 * 60 * 24, async () => {
      const url = `${this.env.WORLDBANK_BASE}/country/${iso}/indicator/${opts.indicator}?format=json&per_page=200${range}`;
      const r = await fetch(url);
      if (!r.ok) throw new Error(`World Bank ${r.status}`);
      const json: any = await r.json();
      const meta = json[0];
      const data = json[1] ?? [];
      const totalPages = meta?.pages ?? 1;
      let allData: any[] = [...data];
      for (let page = 2; page <= Math.min(totalPages, 25); page++) {
        const r2 = await fetch(`${url}&page=${page}`);
        if (!r2.ok) break;
        const j2: any = await r2.json();
        allData = allData.concat(j2[1] ?? []);
      }
      return allData
        .filter((d) => d.value !== null)
        .map((d) => ({
          country: d.country?.value, countryCode: d.country?.id,
          indicator: opts.indicator, indicatorName: d.indicator?.value,
          date: d.date, value: d.value,
        }))
        .sort((a, b) => parseInt(b.date) - parseInt(a.date));
    });
  }

  /** Search World Bank indicators by free-text. */
  async wbSearchIndicators(query: string): Promise<Array<{ id: string; name: string; source?: string }>> {
    const key = `wbsi:${query.toLowerCase()}`;
    return this.cache.memoize(key, 60 * 60 * 24 * 7, async () => {
      const r = await fetch(`${this.env.WORLDBANK_BASE}/indicator?format=json&per_page=1000`);
      if (!r.ok) throw new Error(`World Bank ${r.status}`);
      const json: any = await r.json();
      const list = json[1] ?? [];
      const q = query.toLowerCase();
      return list.filter((i: any) => i.name?.toLowerCase().includes(q))
                 .slice(0, 25)
                 .map((i: any) => ({ id: i.id, name: i.name, source: i.source?.value }));
    });
  }

  /** FRED series observations. */
  async fredSeries(opts: { series_id: string; date_from?: string; date_to?: string }): Promise<FredObservation[]> {
    if (!this.env.FRED_API_KEY) throw new Error("FRED_API_KEY not configured");
    const params = new URLSearchParams({
      series_id: opts.series_id, api_key: this.env.FRED_API_KEY, file_type: "json",
      ...(opts.date_from ? { observation_start: opts.date_from } : {}),
      ...(opts.date_to ? { observation_end: opts.date_to } : {}),
    });
    const key = `fred:${stableKey(opts)}`;
    return this.cache.memoize(key, 60 * 60 * 6, async () => {
      const r = await fetch(`${this.env.FRED_BASE}/series/observations?${params}`);
      if (!r.ok) throw new Error(`FRED ${r.status}`);
      const json: any = await r.json();
      return (json?.observations ?? []).map((o: any) => ({
        date: o.date,
        value: o.value === "." ? null : parseFloat(o.value),
      }));
    });
  }

  async fredSearchSeries(query: string): Promise<Array<{ id: string; title: string; units?: string; frequency?: string }>> {
    if (!this.env.FRED_API_KEY) throw new Error("FRED_API_KEY not configured");
    const params = new URLSearchParams({
      search_text: query, api_key: this.env.FRED_API_KEY, file_type: "json", limit: "25",
    });
    const key = `freds:${query.toLowerCase()}`;
    return this.cache.memoize(key, 60 * 60 * 24, async () => {
      const r = await fetch(`${this.env.FRED_BASE}/series/search?${params}`);
      if (!r.ok) throw new Error(`FRED ${r.status}`);
      const json: any = await r.json();
      return (json?.seriess ?? []).map((s: any) => ({
        id: s.id, title: s.title, units: s.units, frequency: s.frequency,
      }));
    });
  }

  /** Side-by-side indicator comparison across countries. */
  async compareCountries(opts: { countries: string[]; indicator: string; year?: number }): Promise<Array<{ country: string; countryCode: string; value: number | null; year: string }>> {
    const yearFrom = opts.year ?? new Date().getFullYear() - 1;
    const results = await Promise.all(
      opts.countries.map(async (c) => {
        const data = await this.wbIndicator({ country: c, indicator: opts.indicator, yearFrom, yearTo: yearFrom });
        const latest = data[0];
        return {
          country: latest?.country ?? c, countryCode: latest?.countryCode ?? this.toIso3(c),
          value: latest?.value ?? null, year: latest?.date ?? String(yearFrom),
        };
      })
    );
    return results;
  }

  async economicCalendar(_country: string, _daysAhead: number = 14): Promise<Array<{ date: string; country: string; release: string; importance: string }>> {
    // Premium tool. Combines: FRED release calendar + a few national stat-office RSS feeds.
    // Open shim returns a static demo list; private repo has the live aggregation.
    return [
      { date: "2026-06-12", country: "US", release: "CPI", importance: "high" },
      { date: "2026-06-13", country: "US", release: "Initial Jobless Claims", importance: "medium" },
      { date: "2026-06-18", country: "US", release: "FOMC Statement", importance: "high" },
    ];
  }
}

export { COUNTRY_NAME_TO_ISO3 };
