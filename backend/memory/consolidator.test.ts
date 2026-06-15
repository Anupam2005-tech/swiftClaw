import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { applyMemoryPatch } from "./consolidator.ts";
import { createEmptyStore, setStorePathForTests } from "./store.ts";

describe("applyMemoryPatch", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "swiftclaw-memory-"));
    setStorePathForTests(path.join(tempDir, "store.json"));
  });

  afterEach(() => {
    setStorePathForTests(null);
    fs.rmSync(tempDir, { recursive: true, force: true });
  });
  test("merges preferences with last write wins", () => {
    const store = createEmptyStore();
    store.preferences = { tone: "formal" };

    const updated = applyMemoryPatch(store, {
      preferences: { tone: "casual", responseLength: "short" },
    });

    expect(updated.preferences.tone).toBe("casual");
    expect(updated.preferences.responseLength).toBe("short");
  });

  test("deduplicates inferred facts", () => {
    const store = createEmptyStore();
    store.facts.push({
      id: "1",
      content: "Prefers concise responses",
      category: "preference",
      source: "explicit",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const updated = applyMemoryPatch(store, {
      facts: [{ content: "prefers concise responses", category: "preference" }],
    });

    expect(updated.facts).toHaveLength(1);
  });

  test("adds new inferred facts", () => {
    const store = createEmptyStore();

    const updated = applyMemoryPatch(store, {
      facts: [{ content: "Uses TypeScript exclusively", category: "workflow" }],
    });

    expect(updated.facts).toHaveLength(1);
    expect(updated.facts[0]?.source).toBe("inferred");
    expect(updated.facts[0]?.category).toBe("workflow");
  });

  test("ignores empty preference values", () => {
    const store = createEmptyStore();
    store.preferences = { tone: "casual" };

    const updated = applyMemoryPatch(store, {
      preferences: { tone: "  ", communicationStyle: "concise" },
    });

    expect(updated.preferences.tone).toBe("casual");
    expect(updated.preferences.communicationStyle).toBe("concise");
  });
});
