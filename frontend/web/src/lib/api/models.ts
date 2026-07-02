"use client";

import { ProviderId } from "../types/provider";

export interface ModelInfo {
  id: string;
  provider: string;
  name: string;
  context_length?: number | null;
  supports_vision?: boolean;
  supports_tools?: boolean;
  supports_streaming?: boolean;
}

export interface ModelDiscoveryError {
  code: "invalid_key" | "rate_limited" | "network_error" | "empty_response" | "unknown";
  message: string;
}

export interface ModelDiscoveryResult {
  models: ModelInfo[];
  error: ModelDiscoveryError | null;
}

const CACHE_KEY_PREFIX = "sc_models_";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

interface CacheEntry {
  models: ModelInfo[];
  fetchedAt: number;
}

export function clearModelCache(provider: string) {
  if (typeof window !== "undefined") {
    localStorage.removeItem(`${CACHE_KEY_PREFIX}${provider}`);
  }
}

function getCache(provider: string): CacheEntry | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${CACHE_KEY_PREFIX}${provider}`);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry;
    if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) {
      localStorage.removeItem(`${CACHE_KEY_PREFIX}${provider}`);
      return null;
    }
    return entry;
  } catch {
    return null;
  }
}

function setCache(provider: string, models: ModelInfo[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      `${CACHE_KEY_PREFIX}${provider}`,
      JSON.stringify({ models, fetchedAt: Date.now() })
    );
  } catch {
    /* localStorage full — ignore */
  }
}

async function getAuthToken(): Promise<string> {
  if (typeof window === "undefined") return "";
  try {
    const { auth } = await import("../firebase/config");
    const user = auth.currentUser;
    if (user) return await user.getIdToken();
  } catch { /* noop */ }
  return "";
}

export async function discoverModels(provider: ProviderId): Promise<ModelDiscoveryResult> {
  const cached = getCache(provider);
  if (cached) return { models: cached.models, error: null };

  try {
    const token = await getAuthToken();
    const sessionId = typeof window !== "undefined"
      ? document.cookie.split("; ").find((r) => r.startsWith("sc_session_id="))?.split("=")[1] || ""
      : "";
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (sessionId) headers["X-Session-Id"] = sessionId;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/keys/${provider}/models`,
      { headers, credentials: "include" }
    );

    if (!res.ok) {
      return {
        models: [],
        error: { code: "network_error", message: `Request failed with status ${res.status}` },
      };
    }

    const data = await res.json();

    // Backend now returns structured error when discovery fails
    if (data.error) {
      return { models: [], error: data.error as ModelDiscoveryError };
    }

    const models: ModelInfo[] = (data.models || []).map((m: any) => ({
      id: m.id,
      provider: m.provider || provider,
      name: m.name || m.id,
      context_length: m.context_length ?? null,
      supports_vision: m.supports_vision ?? false,
      supports_tools: m.supports_tools ?? true,
      supports_streaming: m.supports_streaming ?? true,
    }));

    if (models.length > 0) {
      setCache(provider, models);
    }

    return { models, error: null };
  } catch (err) {
    return {
      models: [],
      error: { code: "network_error", message: `Could not connect to the server: ${err}` },
    };
  }
}
