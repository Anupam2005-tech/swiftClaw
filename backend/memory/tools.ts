import { tool } from "ai";
import { z } from "zod";
import { TOOL_DESCRIPTIONS } from "../modes/prompts.ts";
import { addFact, findSimilarFact, loadMemoryStore, removeFact } from "./store.ts";

export function createMemoryTools() {
  return {
    remember: tool({
      description: TOOL_DESCRIPTIONS.remember,
      inputSchema: z.object({
        content: z.string().describe("The fact or preference to remember"),
        category: z
          .enum(["preference", "context", "workflow"])
          .optional()
          .default("preference")
          .describe("Category of the memory"),
      }),
      execute: async ({ content, category }) => {
        const store = loadMemoryStore();
        const similar = findSimilarFact(store.facts, content);
        addFact(content, category, "explicit");
        if (similar) {
          return `Updated memory: "${content.trim()}"`;
        }
        return `Remembered: "${content.trim()}"`;
      },
    }),

    forget: tool({
      description: TOOL_DESCRIPTIONS.forget,
      inputSchema: z.object({
        content: z
          .string()
          .describe("The fact to forget — id or text matching a stored fact"),
      }),
      execute: async ({ content }) => {
        const before = loadMemoryStore();
        const match =
          before.facts.find((f) => f.id === content.trim()) ??
          findSimilarFact(before.facts, content);
        if (!match) {
          return "No matching memory found.";
        }
        removeFact(match.id);
        return `Forgot: "${match.content}"`;
      },
    }),
  };
}
