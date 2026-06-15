import { describe, expect, test } from "bun:test";
import { MEMORY_CONTEXT_CHAR_LIMIT, formatMemoryContext } from "./format.ts";
import { createEmptyStore } from "./store.ts";

describe("formatMemoryContext", () => {
  test("returns empty string for empty store", () => {
    expect(formatMemoryContext(createEmptyStore())).toBe("");
  });

  test("includes profile and preferences", () => {
    const store = createEmptyStore();
    store.profile = { name: "Anupam", profession: "engineer" };
    store.preferences = { tone: "casual", responseLength: "short" };

    const block = formatMemoryContext(store);
    expect(block).toContain("## User Context (long-term memory)");
    expect(block).toContain("Name: Anupam");
    expect(block).toContain("Profession: Engineer");
    expect(block).toContain("Tone: casual");
    expect(block).toContain("Response length: short");
  });

  test("respects character limit", () => {
    const store = createEmptyStore();
    store.profile = { name: "Anupam", profession: "engineer" };
    for (let i = 0; i < 20; i++) {
      store.facts.push({
        id: String(i),
        content: `Very long preference fact number ${i} with extra detail to inflate size`,
        category: "preference",
        source: "explicit",
        createdAt: new Date().toISOString(),
        updatedAt: new Date(Date.now() + i).toISOString(),
      });
    }

    const block = formatMemoryContext(store);
    expect(block.length).toBeLessThanOrEqual(MEMORY_CONTEXT_CHAR_LIMIT);
  });

  test("prioritizes profile over facts when truncating", () => {
    const store = createEmptyStore();
    store.profile = { name: "Anupam", profession: "engineer" };
    for (let i = 0; i < 15; i++) {
      store.facts.push({
        id: String(i),
        content: `Fact ${i}: ${"x".repeat(80)}`,
        category: "preference",
        source: "explicit",
        createdAt: new Date().toISOString(),
        updatedAt: new Date(Date.now() + i).toISOString(),
      });
    }

    const block = formatMemoryContext(store);
    expect(block).toContain("Name: Anupam");
  });
});
