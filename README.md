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


---

## Sister MCPs

All from the same operator, all live on `<product>.prakhar-cognizance.workers.dev`, all free-tier friendly:

| Group | Products |
|---|---|
| **Research** | [sec-edgar](https://github.com/guptaprakhariitr/sec-edgar-mcp) · [arxiv](https://github.com/guptaprakhariitr/arxiv-mcp) · [world-bank-economic](https://github.com/guptaprakhariitr/world-bank-economic-mcp) · [uspto-patents](https://github.com/guptaprakhariitr/uspto-patents-mcp) · [fda-approvals](https://github.com/guptaprakhariitr/fda-approvals-mcp) |
| **Verification + Utility** | [verification](https://github.com/guptaprakhariitr/verification-mcp) ⭐ · [unit-converter](https://github.com/guptaprakhariitr/unit-converter-mcp) |
| **India** | [indic-normalize](https://github.com/guptaprakhariitr/indic-normalize-mcp) · [indian-regulatory](https://github.com/guptaprakhariitr/indian-regulatory-mcp) |
| **Real-time** | [hn-trending](https://github.com/guptaprakhariitr/hn-trending-mcp) · [wikipedia-recent-changes](https://github.com/guptaprakhariitr/wikipedia-recent-changes-mcp) · [gdelt-events](https://github.com/guptaprakhariitr/gdelt-events-mcp) · [crypto-prices](https://github.com/guptaprakhariitr/crypto-prices-mcp) |
| **Healthcare** | [drug-interaction](https://github.com/guptaprakhariitr/drug-interaction-mcp) |
| **Logistics** | [multi-carrier-tracking](https://github.com/guptaprakhariitr/multi-carrier-tracking-mcp) |

Full catalog: https://github.com/guptaprakhariitr · ⭐ = empty-quadrant / highest-conviction pick.

