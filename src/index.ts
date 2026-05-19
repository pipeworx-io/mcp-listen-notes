interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Listen Notes MCP.
 */


const BASE = 'https://listen-api.listennotes.com/api/v2';
const UA = 'pipeworx-mcp-listen-notes/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'search',
    description: 'Search podcasts/episodes/curated/people.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        type: { type: 'string', description: 'podcast | episode | curated | person' },
        sort_by_date: { type: 'number', description: '0 (relevance, default) | 1 (date desc)' },
        language: { type: 'string' },
        len_min: { type: 'number' },
        len_max: { type: 'number' },
        genre_ids: { type: 'string', description: 'Comma-sep ids.' },
        offset: { type: 'number' },
      },
      required: ['query'],
    },
  },
  { name: 'podcast', description: 'Single podcast.', inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } },
  { name: 'episode', description: 'Single episode.', inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } },
  { name: 'genres', description: 'List genres.', inputSchema: { type: 'object', properties: {} } },
  {
    name: 'best_podcasts',
    description: 'Top podcasts.',
    inputSchema: {
      type: 'object',
      properties: {
        genre_id: { type: 'number' },
        region: { type: 'string' },
        sort: { type: 'string' },
        page: { type: 'number' },
      },
    },
  },
  { name: 'recommendations_for_podcast', description: 'Similar podcasts.', inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } },
  { name: 'recommendations_for_episode', description: 'Similar episodes.', inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const apiKey = (args._apiKey as string | undefined)?.trim();
  if (!apiKey) throw new Error('Listen Notes requires an API key. Set PLATFORM_LISTENNOTES_KEY or pass ?_apiKey=… (free at https://www.listennotes.com/api/dashboard/).');
  const get = async (path: string, params?: URLSearchParams) => {
    const qs = params ? `?${params}` : '';
    const res = await fetch(`${BASE}${path}${qs}`, {
      headers: { Accept: 'application/json', 'User-Agent': UA, 'X-ListenAPI-Key': apiKey },
    });
    if (res.status === 401) throw new Error('Listen Notes: invalid API key.');
    if (res.status === 429) throw new Error('Listen Notes: 429 rate-limit (300/mo free tier).');
    if (!res.ok) throw new Error(`Listen Notes: ${res.status}`);
    return res.json();
  };
  switch (name) {
    case 'search': {
      const p = new URLSearchParams({ q: reqStr(args, 'query', '"AI podcast"') });
      for (const k of ['type', 'language', 'genre_ids'] as const) if (args[k]) p.set(k, String(args[k]));
      for (const k of ['sort_by_date', 'len_min', 'len_max', 'offset'] as const) if (args[k] != null) p.set(k, String(args[k]));
      return get('/search', p);
    }
    case 'podcast':
      return get(`/podcasts/${encodeURIComponent(reqStr(args, 'id', '"<id>"'))}`);
    case 'episode':
      return get(`/episodes/${encodeURIComponent(reqStr(args, 'id', '"<id>"'))}`);
    case 'genres':
      return get('/genres');
    case 'best_podcasts': {
      const p = new URLSearchParams();
      if (args.genre_id != null) p.set('genre_id', String(args.genre_id));
      if (args.region) p.set('region', String(args.region));
      if (args.sort) p.set('sort', String(args.sort));
      if (args.page) p.set('page', String(args.page));
      return get('/best_podcasts', p);
    }
    case 'recommendations_for_podcast':
      return get(`/podcasts/${encodeURIComponent(reqStr(args, 'id', '"<id>"'))}/recommendations`);
    case 'recommendations_for_episode':
      return get(`/episodes/${encodeURIComponent(reqStr(args, 'id', '"<id>"'))}/recommendations`);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
