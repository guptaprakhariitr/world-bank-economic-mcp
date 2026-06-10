# Tools Reference — world-bank-economic-mcp

Per-tool reference for AI agents. The descriptions below are what the LLM reads to decide whether to call your tool — verbatim from `src/tools.ts`.

## `wb_indicator`

World Bank time series for a single indicator and country. Common indicator IDs: NY.GDP.MKTP.CD (GDP USD), FP.CPI.TOTL.ZG (CPI yoy), SL.UEM.TOTL.ZS (unemployment), SP.POP.TOTL (population). Use wb_search_indicator if you don't know the ID.

See `src/tools.ts` for the JSON Schema input.

## `wb_search_indicator`

Free-text search across World Bank indicator names. Returns up to 25 matching indicator IDs + names.

See `src/tools.ts` for the JSON Schema input.

## `fred_series`

St Louis Fed (FRED) series observations. Series IDs e.g. 'CPIAUCSL' (CPI), 'UNRATE', 'DGS10' (10Y), 'FEDFUNDS'.

See `src/tools.ts` for the JSON Schema input.

## `fred_search_series`

Free-text search across FRED series. Returns id, title, units, frequency.

See `src/tools.ts` for the JSON Schema input.

## `compare_countries`

Side-by-side comparison of an indicator across multiple countries for a given year (default = most recent available).

See `src/tools.ts` for the JSON Schema input.

## `economic_calendar`

Upcoming economic releases (CPI, NFP, FOMC, etc.). Premium tool.

See `src/tools.ts` for the JSON Schema input.

## Client setup

### Cursor / Claude Desktop / Cline
```json
{
  "mcpServers": {
    "world-bank-economic-mcp": {
      "url": "https://world-bank-economic-mcp.prakhar-cognizance.workers.dev/mcp",
      "headers": { "Authorization": "Bearer YOUR_API_KEY" }
    }
  }
}
```

Anonymous requests get the free tier (100 calls/month, 10/min). Upgrade at `/upgrade?tier=solo|team|pro`.