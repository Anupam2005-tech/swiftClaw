import { tool } from "ai";
import { z } from "zod";
import Firecrawl from "@mendable/firecrawl-js";
import { ActionTracker } from "../agent/action-tracker";
import { TOOL_DESCRIPTIONS } from "../prompts";

let client: Firecrawl | null = null;
function getClient(): Firecrawl {
  if (client) return client;
  client = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });
  return client;
}
function clip(s: string, n = 8000): string {
  return s.length > n ? s.slice(0, n) + "\n... [truncated]" : s;
}

export function createWebTools(tracker: ActionTracker) {
  return {
    web_search: tool({
      description: TOOL_DESCRIPTIONS.web_search,
      inputSchema: z.object({
        query: z.string().min(1),
        limit: z.number().int().min(1).max(10).optional().default(5),
      }),
      execute: async ({ query, limit }) => {
        const res = await getClient().search(query, {
          limit,
          sources: ["web"],
        });
        const items = (res.web ?? []).slice(0, limit);
        const out = items.map((d, i) => {
          if (!d) return "";
          const title =
            (typeof d === "object" && "title" in d && d.title) ||
            (typeof d === "object" && "metadata" in d && d.metadata?.title) ||
            " (untitled)";
          const url =
            (typeof d === "object" && "url" in d && d.url) ||
            (typeof d === "object" && "metadata" in d && d.metadata?.url) ||
            "";
          const snip =
            (typeof d === "object" && "description" in d && d.description) ||
            (typeof d === "object" && "summary" in d && d.summary) ||
            "";
          return `${i + 1}. ${title}\n   URL: ${url}\n   Snippet: ${clip(snip, 300)}`;
        });
        const resultText = out.filter(Boolean).join("\n\n");
        tracker.log({
          type: "code_analysis",
          path: `web_search: ${query}`,
          details: {
            toolName: "web_search",
            query,
            after: resultText,
          },
          status: "executed",
        });
        return resultText;
      },
    }),

    web_crawl: tool({
      description: TOOL_DESCRIPTIONS.web_crawl,
      inputSchema: z.object({ url: z.string().url() }),
      execute: async ({ url }) => {
        const doc = await getClient().scrape(url, { formats: ['markdown'] });
        const md = (doc as { markdown?: string }).markdown ?? '';
        tracker.log({
          type: 'code_analysis',
          path: `web_crawl: ${url}`,
          details: { after: clip(md), toolName: 'web_crawl' },
          status: 'executed',
        });
        return clip(md) || ' (empty)';
      },
    }),

    fetch_url: tool({
      description: TOOL_DESCRIPTIONS.fetch_url,
      inputSchema: z.object({ url: z.string().url() }),
      execute: async ({ url }) => {
        const r = await fetch(url, { redirect: 'follow' });
        const body = await r.text();
        const out = clip(body, 16_000);
        tracker.log({
          type: 'code_analysis',
          path: `fetch: ${url}`,
          details: { after: `HTTP ${r.status}\n\n${out}`, toolName: 'fetch_url' },
          status: 'executed',
        });
        return `HTTP ${r.status}\n\n${out}`;
      },
    }),
  };
}

