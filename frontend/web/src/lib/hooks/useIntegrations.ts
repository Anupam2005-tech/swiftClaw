"use client";

import { useState, useEffect, useCallback } from "react";
import { Integration, IntegrationId } from "../types/integration";
import { api } from "../api/client";

export const useIntegrations = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIntegrations = useCallback(async () => {
    setLoading(true);
    try {
      const list = await api.listIntegrations();
      setIntegrations(list);
    } catch (err) {
      console.error("Failed to load integrations:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  const toggleIntegration = async (id: IntegrationId, enabled: boolean) => {
    // optimistic UI update
    setIntegrations((prev) =>
      prev.map((i) => (i.id === id ? { ...i, enabled } : i))
    );

    try {
      await api.toggleIntegration(id, enabled);
      await fetchIntegrations(); // sync back
    } catch (err) {
      console.error(`Failed to toggle integration ${id}:`, err);
      // rollback
      setIntegrations((prev) =>
        prev.map((i) => (i.id === id ? { ...i, enabled: !enabled } : i))
      );
    }
  };

  return {
    integrations,
    loading,
    toggleIntegration,
    refreshIntegrations: fetchIntegrations,
  };
};
