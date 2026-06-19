"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ProviderId } from "../types/provider";
import { ModelInfo, ModelDiscoveryError, discoverModels, clearModelCache } from "../api/models";

const DEFAULT_REFRESH_MS = 24 * 60 * 60 * 1000;

export function useProviderModels(provider: ProviderId | null) {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ModelDiscoveryError | null>(null);

  const fetch = useCallback(async () => {
    if (!provider) {
      setModels([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await discoverModels(provider);
      setModels(result.models);
      setError(result.error);
    } finally {
      setLoading(false);
    }
  }, [provider]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { models, loading, error, refresh: fetch };
}

export function useAllProviderModels(
  providers: ProviderId[],
  refreshIntervalMs: number = DEFAULT_REFRESH_MS
) {
  const [modelMap, setModelMap] = useState<Partial<Record<ProviderId, ModelInfo[]>>>({});
  const [errorMap, setErrorMap] = useState<Partial<Record<ProviderId, ModelDiscoveryError | null>>>({});
  const [loading, setLoading] = useState(false);
  const providersKey = providers.sort().join(",");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAll = useCallback(async (forceBustCache: boolean = false) => {
    setLoading(true);
    if (forceBustCache) {
      providers.forEach((p) => clearModelCache(p));
    }
    const map: Partial<Record<ProviderId, ModelInfo[]>> = {};
    const errs: Partial<Record<ProviderId, ModelDiscoveryError | null>> = {};
    await Promise.all(
      providers.map(async (p) => {
        try {
          const result = await discoverModels(p);
          map[p] = result.models;
          errs[p] = result.error;
        } catch {
          map[p] = [];
          errs[p] = { code: "unknown", message: "Unexpected error fetching models." };
        }
      })
    );
    setModelMap(map);
    setErrorMap(errs);
    setLoading(false);
  }, [providersKey]);

  useEffect(() => {
    if (providers.length > 0) {
      fetchAll();
    }
  }, [fetchAll]);

  // Background periodic refresh
  useEffect(() => {
    if (refreshIntervalMs <= 0 || providers.length === 0) return;

    intervalRef.current = setInterval(() => {
      fetchAll(true);
    }, refreshIntervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [providersKey, refreshIntervalMs, fetchAll]);

  return { modelMap, errorMap, loading, refreshAll: () => fetchAll(true) };
}
