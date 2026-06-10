import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MacroClient, COUNTRY_NAME_TO_ISO3 } from "../src/macro";
import { McpServer, ToolContext } from "../src/mcp-server";
import { buildTools } from "../src/tools";

class FakeKv {
  store = new Map<string, string>();
  async get(key: string, type?: "text" | "json"): Promise<any> {
    const v = this.store.get(key); if (v === undefined) return null;
    if (type === "json") return JSON.parse(v); return v;
  }
  async put(key: string, value: string): Promise<void> { this.store.set(key, value); }
  async delete(key: string): Promise<void> { this.store.delete(key); }
}

const env = {
  CACHE: new FakeKv() as unknown as KVNamespace,
  USAGE: new FakeKv() as unknown as KVNamespace,
  WORLDBANK_BASE: "https://api.worldbank.org/v2",
  FRED_BASE: "https://api.stlouisfed.org/fred",
  FRED_API_KEY: "test-key",
  UPGRADE_URL: "x",
};

const fixWBGdpIndia = [
  { pages: 1, total: 3 },
  [
    { country: { value: "India", id: "IN" }, indicator: { value: "GDP (current US$)" }, date: "2024", value: 3568000000000 },
    { country: { value: "India", id: "IN" }, indicator: { value: "GDP (current US$)" }, date: "2023", value: 3173000000000 },
    { country: { value: "India", id: "IN" }, indicator: { value: "GDP (current US$)" }, date: "2022", value: 3417000000000 },
  ],
];

const fixWBSearch = [
  { pages: 1, total: 2 },
  [
    { id: "NY.GDP.MKTP.CD", name: "GDP (current US$)", source: { value: "World Development Indicators" } },
    { id: "FP.CPI.TOTL.ZG", name: "Inflation, consumer prices (annual %)", source: { value: "World Development Indicators" } },
  ],
];

const fixFredCpi = {
  observations: [
    { date: "2026-01-01", value: "310.32" },
    { date: "2026-02-01", value: "311.50" },
    { date: "2026-03-01", value: "." },          // missing value
    { date: "2026-04-01", value: "313.05" },
  ],
};

beforeEach(() => {
  (env.CACHE as any).store = new Map();
  vi.stubGlobal("fetch", async (url: string | URL) => {
    const u = typeof url === "string" ? url : url.toString();
    if (u.includes("/country/IND/indicator/NY.GDP.MKTP.CD")) return jr(fixWBGdpIndia);
    if (u.includes("/country/USA/indicator/NY.GDP.MKTP.CD")) return jr([{ pages: 1 }, [{ country: { value: "United States", id: "US" }, indicator: { value: "GDP" }, date: "2024", value: 28000000000000 }]]);
    if (u.includes("/indicator?format=json"))                return jr(fixWBSearch);
    if (u.includes("/series/observations"))                  return jr(fixFredCpi);
    if (u.includes("/series/search"))                        return jr({ seriess: [{ id: "CPIAUCSL", title: "CPI All Urban Consumers", units: "Index", frequency: "Monthly" }] });
    return jr({});
  });
});

afterEach(() => vi.unstubAllGlobals());

function jr(b: unknown): Response { return new Response(JSON.stringify(b), { status: 200 }); }

describe("country normalization", () => {
  it("maps common names + ISO2 to ISO3", () => {
    const c = new MacroClient(env as any);
    expect(c.toIso3("India")).toBe("IND");
    expect(c.toIso3("IN")).toBe("IND");
    expect(c.toIso3("US")).toBe("USA");
    expect(c.toIso3("United States")).toBe("USA");
  });
  it("includes UK alias", () => {
    expect(COUNTRY_NAME_TO_ISO3["UK"]).toBe("GBR");
  });
});

describe("wb_indicator", () => {
  it("fetches GDP series for India, newest first", async () => {
    const c = new MacroClient(env as any);
    const s = await c.wbIndicator({ country: "India", indicator: "NY.GDP.MKTP.CD" });
    expect(s.length).toBe(3);
    expect(s[0].date).toBe("2024");
    expect(s[0].value).toBe(3568000000000);
  });
});

describe("wb_search_indicator", () => {
  it("searches indicator names", async () => {
    const c = new MacroClient(env as any);
    const out = await c.wbSearchIndicators("GDP");
    expect(out.length).toBeGreaterThan(0);
    expect(out[0].id).toBe("NY.GDP.MKTP.CD");
  });
});

describe("fred_series", () => {
  it("converts '.' to null and parses values", async () => {
    const c = new MacroClient(env as any);
    const obs = await c.fredSeries({ series_id: "CPIAUCSL" });
    expect(obs.length).toBe(4);
    expect(obs[0].value).toBe(310.32);
    expect(obs[2].value).toBeNull();
  });
  it("throws if FRED_API_KEY missing", async () => {
    const c = new MacroClient({ ...env, FRED_API_KEY: undefined } as any);
    await expect(c.fredSeries({ series_id: "CPIAUCSL" })).rejects.toThrow(/FRED_API_KEY/);
  });
});

describe("compare_countries", () => {
  it("returns one row per country", async () => {
    const c = new MacroClient(env as any);
    const cmp = await c.compareCountries({ countries: ["India", "United States"], indicator: "NY.GDP.MKTP.CD", year: 2024 });
    expect(cmp.length).toBe(2);
    expect(cmp[0].value).toBeGreaterThan(0);
  });
});

describe("MCP protocol", () => {
  const server = new McpServer({ name: "world-bank-economic-mcp", version: "0.1.0" });
  for (const t of buildTools()) server.register(t);
  const ctx: ToolContext = { env: env as any, apiKey: null, tier: "free", callsRemaining: 100 };

  it("free tier hides economic_calendar (premium)", async () => {
    const r = await server.handle({ jsonrpc: "2.0", id: 1, method: "tools/list" }, ctx);
    const names = (r!.result as any).tools.map((t: any) => t.name) as string[];
    expect(names).not.toContain("economic_calendar");
    expect(names).toContain("wb_indicator");
    expect(names).toContain("fred_series");
  });

  it("wb_indicator end-to-end", async () => {
    const r = await server.handle(
      { jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "wb_indicator", arguments: { country: "India", indicator: "NY.GDP.MKTP.CD" } } }, ctx
    );
    const out = JSON.parse((r!.result as any).content[0].text);
    expect(out.count).toBe(3);
    expect(out.series[0].country).toBe("India");
  });
});
