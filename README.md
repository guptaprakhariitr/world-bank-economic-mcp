# world-bank-economic-mcp — SCAFFOLD

> Macro-economic data from World Bank, IMF, FRED, OECD, RBI. Wraps free public APIs into a unified `get_indicator(country, indicator, year_range)` surface.

**Status:** scaffolded. Bundle with a future `fred-mcp` into a **"macro pack"**. Idea #7 in [`../../../ai-as-customer-ideas.md`](../../../ai-as-customer-ideas.md).

---

## Planned tools

| Tool | Source | What it returns |
|---|---|---|
| `wb_indicator(country, indicator, year_range)` | World Bank Indicators API | GDP, inflation, unemployment, population, debt-to-GDP, etc. |
| `wb_search_indicator(query)` | World Bank metadata | Find the right indicator code from a natural-language description. |
| `imf_data_series(database, series_code, range)` | IMF data API | IMF series (e.g. IFS, BOP). |
| `fred_series(series_id, range)` | FRED API | St. Louis Fed series (CPI, unemployment, fed funds, etc.). |
| `oecd_data(dataset, filter)` | OECD SDMX | OECD datasets. |
| `compare_countries(indicator, countries[], year)` | World Bank | Side-by-side. |
| `economic_calendar(country, days_ahead?)` | composite | Upcoming releases (NFP, CPI, etc.). Premium. |

## Audience

- Macro / fixed-income agents.
- Journalism / research agents.
- Educational agents (students, courses).
- Cross-sell to `sec-edgar-mcp` (fixed-income + corporate research go together).

## Open / closed split

- **Open**: World Bank wrapper, FRED wrapper, OECD wrapper.
- **Closed**: indicator-name normalization (cross-source mapping — same indicator named differently in WB vs IMF vs OECD), economic-calendar aggregation, premium subscriptions.

## Notes

- All these APIs are stable and well-documented; this is the easiest Category 1 product to ship technically.
- Lower urgency than the others — buyer pool is smaller and patient.
- Good fourth or fifth product to ship; uses spare capacity to deepen the macro/finance bundle.

## See also

- [`../sec-edgar-mcp/`](../sec-edgar-mcp/) — pair with this.
- [`../README.md`](../README.md) — Category 1 pipeline.
