"use client";

import { useState, useEffect, useCallback } from "react";
import { ModelPreferences, TaskType, ProviderId } from "../types/provider";
import { api } from "../api/client";

export const useModelPreferences = () => {
  const [preferences, setPreferences] = useState<ModelPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPreferences = useCallback(async () => {
    setLoading(true);
    try {
      const prefs = await api.getPreferences();
      setPreferences(prefs);
    } catch (err) {
      console.error("Failed to load model preferences:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const updatePreference = async (task: TaskType, provider: ProviderId, model: string) => {
    if (!preferences) return;
    
    const updated = {
      ...preferences,
      [task]: { task, provider, model },
    };

    setPreferences(updated);
    try {
      await api.setPreferences(updated);
    } catch (err) {
      console.error(`Failed to save model preference for task ${task}:`, err);
    }
  };

  return {
    preferences,
    loading,
    updatePreference,
    refreshPreferences: fetchPreferences,
  };
};
