# @pipeworx/listen-notes

[Listen Notes](https://www.listennotes.com/api/) MCP — podcast directory. Free tier 300 req/month.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Auth

- Platform: `PLATFORM_LISTENNOTES_KEY`. BYO: `?_apiKey=…`.

## Tools

- `search(query, type?, sort_by_date?, language?, len_min?, len_max?, genre_ids?, offset?)` — search
- `podcast(id)` — single podcast
- `episode(id)` — single episode
- `genres()` — list genres
- `best_podcasts(genre_id?, region?, sort?, page?)` — top podcasts
- `recommendations_for_podcast(id)` — similar podcasts
- `recommendations_for_episode(id)` — similar episodes

## Data source

`https://listen-api.listennotes.com/api/v2/`

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "listen-notes": {
      "url": "https://gateway.pipeworx.io/listen-notes/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Listen Notes data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
