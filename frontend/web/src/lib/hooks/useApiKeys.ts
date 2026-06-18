"use client";

import { useState, useEffect, useCallback } from "react";
import { KeyMeta, ProviderId } from "../types/provider";
import { api } from "../api/client";

export const useApiKeys = () => {
  const [keys, setKeys] = useState<KeyMeta[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    try {
      const list = await api.listKeys();
      setKeys(list);
    } catch (err) {
      console.error("Failed to fetch keys:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const addKey = async (provider: ProviderId, apiKey: string) => {
    const res = await api.addKey(provider, apiKey);
    if (res.success) {
      await fetchKeys();
    }
    return res;
  };

  const updateKey = async (provider: ProviderId, apiKey: string) => {
    const res = await api.addKey(provider, apiKey);
    if (res.success) {
      await fetchKeys();
    }
    return res;
  };

  const removeKey = async (provider: ProviderId) => {
    await api.removeKey(provider);
    await fetchKeys();
  };

  return {
    keys,
    loading,
    addKey,
    updateKey,
    removeKey,
    refreshKeys: fetchKeys,
  };
};
