import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { loadSwiftClawEnv, MEMORY_DIR, MEMORY_STORE_PATH } from "../utils/config.ts";
import type {
  MemoryFact,
  MemoryFactCategory,
  MemoryFactSource,
  MemoryPreferences,
  MemoryProfile,
  MemoryStore,
} from "./types.ts";

export { MEMORY_DIR, MEMORY_STORE_PATH };

let storePathOverride: string | null = null;

/** @internal Test hook */
export function setStorePathForTests(storePath: string | null): void {
  storePathOverride = storePath;
}

function getStorePath(): string {
  return storePathOverride ?? MEMORY_STORE_PATH;
}

export function createEmptyStore(): MemoryStore {
  return {
    version: 1,
    profile: { name: "", profession: "other" },
    preferences: {},
    facts: [],
  };
}

export function memoryStoreExists(): boolean {
  return fs.existsSync(getStorePath());
}

export function isMemoryOnboarded(store: MemoryStore): boolean {
  return store.profile.name.trim().length > 0;
}

function ensureMemoryDir(): void {
  const dir = path.dirname(getStorePath());
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function seedNameFromEnv(store: MemoryStore): MemoryStore {
  loadSwiftClawEnv();
  const envName = process.env.USER_NAME?.trim();
  if (envName && !store.profile.name.trim()) {
    store.profile.name = envName;
  }
  return store;
}

export function loadMemoryStore(): MemoryStore {
  const storePath = getStorePath();
  if (!fs.existsSync(storePath)) {
    return seedNameFromEnv(createEmptyStore());
  }

  try {
    const raw = fs.readFileSync(storePath, "utf8");
    const parsed = JSON.parse(raw) as MemoryStore;
    if (parsed.version !== 1) {
      return seedNameFromEnv(createEmptyStore());
    }
    return seedNameFromEnv({
      version: 1,
      profile: parsed.profile ?? { name: "", profession: "other" },
      preferences: parsed.preferences ?? {},
      facts: Array.isArray(parsed.facts) ? parsed.facts : [],
    });
  } catch {
    return seedNameFromEnv(createEmptyStore());
  }
}

export function saveMemoryStore(store: MemoryStore): void {
  ensureMemoryDir();
  fs.writeFileSync(getStorePath(), `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

export function ensureMemoryStore(): MemoryStore {
  const store = loadMemoryStore();
  if (memoryStoreExists()) return store;
  saveMemoryStore(store);
  return store;
}

export function updateProfile(profile: Partial<MemoryProfile>): MemoryStore {
  const store = loadMemoryStore();
  store.profile = { ...store.profile, ...profile };
  saveMemoryStore(store);
  return store;
}

export function updatePreferences(preferences: Partial<MemoryPreferences>): MemoryStore {
  const store = loadMemoryStore();
  store.preferences = { ...store.preferences, ...preferences };
  saveMemoryStore(store);
  return store;
}

function normalizeContent(content: string): string {
  return content.toLowerCase().trim().replace(/\s+/g, " ");
}

export function findSimilarFact(facts: MemoryFact[], content: string): MemoryFact | undefined {
  const normalized = normalizeContent(content);
  return facts.find((fact) => {
    const existing = normalizeContent(fact.content);
    return (
      existing === normalized ||
      existing.includes(normalized) ||
      normalized.includes(existing)
    );
  });
}

export function addFact(
  content: string,
  category: MemoryFactCategory,
  source: MemoryFactSource,
): MemoryStore {
  const store = loadMemoryStore();
  const trimmed = content.trim();
  if (!trimmed) return store;

  const existing = findSimilarFact(store.facts, trimmed);
  const now = new Date().toISOString();

  if (existing) {
    existing.content = trimmed;
    existing.category = category;
    existing.source = source;
    existing.updatedAt = now;
  } else {
    store.facts.push({
      id: randomUUID(),
      content: trimmed,
      category,
      source,
      createdAt: now,
      updatedAt: now,
    });
  }

  saveMemoryStore(store);
  return store;
}

export function updateFact(id: string, content: string): MemoryStore {
  const store = loadMemoryStore();
  const fact = store.facts.find((f) => f.id === id);
  if (!fact) return store;

  fact.content = content.trim();
  fact.updatedAt = new Date().toISOString();
  saveMemoryStore(store);
  return store;
}

export function removeFact(idOrContent: string): MemoryStore {
  const store = loadMemoryStore();
  const trimmed = idOrContent.trim();
  const byId = store.facts.find((f) => f.id === trimmed);
  if (byId) {
    store.facts = store.facts.filter((f) => f.id !== trimmed);
    saveMemoryStore(store);
    return store;
  }

  const similar = findSimilarFact(store.facts, trimmed);
  if (similar) {
    store.facts = store.facts.filter((f) => f.id !== similar.id);
    saveMemoryStore(store);
  }
  return store;
}

export function clearMemoryStore(): MemoryStore {
  const store = createEmptyStore();
  saveMemoryStore(store);
  return store;
}
