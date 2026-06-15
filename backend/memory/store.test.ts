import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  addFact,
  createEmptyStore,
  findSimilarFact,
  loadMemoryStore,
  removeFact,
  saveMemoryStore,
  setStorePathForTests,
  updatePreferences,
  updateProfile,
} from "./store.ts";

describe("memory store", () => {
  let tempDir: string;
  let storePath: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "swiftclaw-memory-"));
    storePath = path.join(tempDir, "store.json");
    setStorePathForTests(storePath);
  });

  afterEach(() => {
    setStorePathForTests(null);
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test("load/save round trip", () => {
    const store = createEmptyStore();
    store.profile = { name: "Anupam", profession: "engineer" };
    saveMemoryStore(store);

    const loaded = loadMemoryStore();
    expect(loaded.profile.name).toBe("Anupam");
    expect(loaded.profile.profession).toBe("engineer");
  });

  test("addFact deduplicates similar content", () => {
    addFact("prefers tabs over spaces", "preference", "explicit");
    addFact("Prefers tabs over spaces", "preference", "explicit");

    const store = loadMemoryStore();
    expect(store.facts).toHaveLength(1);
    expect(store.facts[0]?.content).toBe("Prefers tabs over spaces");
  });

  test("removeFact by content match", () => {
    addFact("likes concise answers", "preference", "explicit");
    const before = loadMemoryStore();
    const id = before.facts[0]!.id;

    removeFact("likes concise answers");
    const after = loadMemoryStore();
    expect(after.facts.find((f) => f.id === id)).toBeUndefined();
  });

  test("updatePreferences merges keys", () => {
    updatePreferences({ tone: "casual" });
    updatePreferences({ responseLength: "short" });

    const store = loadMemoryStore();
    expect(store.preferences.tone).toBe("casual");
    expect(store.preferences.responseLength).toBe("short");
  });

  test("updateProfile persists profession custom", () => {
    updateProfile({
      name: "Sam",
      profession: "other",
      professionCustom: "Designer",
    });

    const store = loadMemoryStore();
    expect(store.profile.professionCustom).toBe("Designer");
  });

  test("findSimilarFact matches substring", () => {
    const facts = [
      {
        id: "1",
        content: "User prefers tabs over spaces",
        category: "preference" as const,
        source: "explicit" as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    expect(findSimilarFact(facts, "tabs over spaces")).toBeDefined();
  });

  test("seeds name from USER_NAME when store file missing", () => {
    const original = process.env.USER_NAME;
    process.env.USER_NAME = "EnvUser";
    try {
      const store = loadMemoryStore();
      expect(store.profile.name).toBe("EnvUser");
    } finally {
      if (original === undefined) delete process.env.USER_NAME;
      else process.env.USER_NAME = original;
    }
  });
});
