import { Tool } from "./mcp-server";
import { MacroClient, MacroEnv } from "./macro";

export function buildTools(): Tool[] {
  return [
    {
      name: "wb_indicator",
      description:
        "World Bank time series for a single indicator and country. Common indicator IDs: NY.GDP.MKTP.CD (GDP USD), FP.CPI.TOTL.ZG (CPI yoy), SL.UEM.TOTL.ZS (unemployment), SP.POP.TOTL (population). Use wb_search_indicator if you don't know the ID.",
      inputSchema: {
        type: "object",
        properties: {
          country: { type: "string", description: "ISO 2/3-letter code OR common name (e.g. 'India', 'IN', 'IND')." },
          indicator: { type: "string", description: "World Bank indicator ID, e.g. 'NY.GDP.MKTP.CD'." },
          year_from: { type: "integer" },
          year_to: { type: "integer" },
        },
        required: ["country", "indicator"],
      },
      handler: async (args, ctx) => {
        const c = new MacroClient(ctx.env as unknown as MacroEnv);
        const out = await c.wbIndicator({ country: args.country, indicator: args.indicator, yearFrom: args.year_from, yearTo: args.year_to });
        return { count: out.length, series: out };
      },
    },
    {
      name: "wb_search_indicator",
      description: "Free-text search across World Bank indicator names. Returns up to 25 matching indicator IDs + names.",
      inputSchema: { type: "object", properties: { query: { type: "string" } }, required: ["query"] },
      handler: async (args, ctx) => {
        const c = new MacroClient(ctx.env as unknown as MacroEnv);
        const out = await c.wbSearchIndicators(args.query);
        return { count: out.length, indicators: out };
      },
    },
    {
      name: "fred_series",
      description: "St Louis Fed (FRED) series observations. Series IDs e.g. 'CPIAUCSL' (CPI), 'UNRATE', 'DGS10' (10Y), 'FEDFUNDS'.",
      inputSchema: {
        type: "object",
        properties: {
          series_id: { type: "string" },
          date_from: { type: "string", description: "ISO YYYY-MM-DD." },
          date_to: { type: "string" },
        },
        required: ["series_id"],
      },
      handler: async (args, ctx) => {
        const c = new MacroClient(ctx.env as unknown as MacroEnv);
        const out = await c.fredSeries({ series_id: args.series_id, date_from: args.date_from, date_to: args.date_to });
        return { count: out.length, observations: out };
      },
    },
    {
      name: "fred_search_series",
      description: "Free-text search across FRED series. Returns id, title, units, frequency.",
      inputSchema: { type: "object", properties: { query: { type: "string" } }, required: ["query"] },
      handler: async (args, ctx) => {
        const c = new MacroClient(ctx.env as unknown as MacroEnv);
        const out = await c.fredSearchSeries(args.query);
        return { count: out.length, series: out };
      },
    },
    {
      name: "compare_countries",
      description: "Side-by-side comparison of an indicator across multiple countries for a given year (default = most recent available).",
      inputSchema: {
        type: "object",
        properties: {
          countries: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 25 },
          indicator: { type: "string" },
          year: { type: "integer" },
        },
        required: ["countries", "indicator"],
      },
      handler: async (args, ctx) => {
        const c = new MacroClient(ctx.env as unknown as MacroEnv);
        const out = await c.compareCountries({ countries: args.countries, indicator: args.indicator, year: args.year });
        return { count: out.length, comparison: out };
      },
    },
    {
      name: "economic_calendar",
      description: "Upcoming economic releases (CPI, NFP, FOMC, etc.). Premium tool.",
      inputSchema: {
        type: "object",
        properties: {
          country: { type: "string", description: "ISO 2-letter or name." },
          days_ahead: { type: "integer", default: 14, minimum: 1, maximum: 60 },
        },
        required: ["country"],
      },
      premium: true,
      handler: async (args, ctx) => {
        const c = new MacroClient(ctx.env as unknown as MacroEnv);
        const out = await c.economicCalendar(args.country, args.days_ahead ?? 14);
        return { count: out.length, releases: out };
      },
    },
  ];
}
