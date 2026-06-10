# Registry Submission Checklist — world-bank-economic-mcp

Pre-filled values for every MCP registry. Each submission takes 1–3 minutes in a browser.

## ✅ Already automatic

### Glama — `glama.ai`
Auto-crawls GitHub by repo topic `mcp-server`. Already tagged. Indexes within 24 hours.
- https://glama.ai/mcp/servers?q=world-bank-economic-mcp

### Official MCP Registry
- The `server.json` at this repo's root is the registry manifest.
- Submit via: `mcp-publisher publish server.json` (after `make publisher` and `mcp-publisher login github` in the registry repo).
- Downstream registries (PulseMCP, mcp.so) ingest from here weekly.

## 🌐 Manual browser submission

### PulseMCP — single URL field
- https://www.pulsemcp.com/submit
- **Paste:** `https://github.com/guptaprakhariitr/world-bank-economic-mcp`

### mcp.so — multi-field form
- https://mcp.so/submit
- **Name:** `world-bank-economic-mcp`
- **Display name:** `World Bank + FRED Macro Data`
- **Description:** `Macro-economic indicators: World Bank, FRED (St Louis Fed), IMF, OECD. Unified query surface for AI agents.`
- **GitHub URL:** `https://github.com/guptaprakhariitr/world-bank-economic-mcp`
- **Endpoint URL:** `https://world-bank-economic-mcp.atlasword.workers.dev/mcp`
- **Tags:** world-bank, fred, imf, oecd, macro, economics, gdp, inflation
- **License:** MIT
- **Transport:** HTTP (remote)

### mcp.directory
- https://mcp.directory/submit
- Same values as mcp.so. Include a demo GIF if you can.

### Smithery (paid — $30/mo)
- https://smithery.ai/new
- Worth it if you have ≥6 paid subscribers.

### Cursor Marketplace
- Submit from Cursor → Settings → Marketplace → Submit. Curated; 1–2 weeks for approval.

## Social

### Show HN
- Title: `Show HN: world-bank-economic-mcp — World Bank + FRED Macro Data as an MCP for Claude / Cursor`
- URL: `https://github.com/guptaprakhariitr/world-bank-economic-mcp`

### Twitter / X thread template
> Just shipped world-bank-economic-mcp — Model Context Protocol server: macro-economic indicators: world bank, fred (st louis fed), imf, oecd.
>
> Endpoint: https://world-bank-economic-mcp.atlasword.workers.dev/mcp
> GitHub: https://github.com/guptaprakhariitr/world-bank-economic-mcp
>
> Free tier available. Paid from $9/mo.
