"use client";

import React from "react";
import { ModelPreferencesTable } from "@/components/settings/ModelPreferencesTable";
import { useModelPreferences } from "@/lib/hooks/useModelPreferences";
import { useApiKeys } from "@/lib/hooks/useApiKeys";

export default function ModelPreferencesPage() {
  const { preferences, loading: prefsLoading, updatePreference } = useModelPreferences();
  const { keys, loading: keysLoading } = useApiKeys();

  const activeKeys = keys.map((k) => k.provider);
  const isLoading = prefsLoading || keysLoading;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Page Title */}
      <div className="border-b border-white/5 pb-4">
        <h2 className="text-sm font-semibold text-sc-text uppercase tracking-wider">
          Task Model Mapping
        </h2>
        <p className="text-[10px] text-sc-text-muted mt-1 leading-normal">
          Map specific developer actions and generations to your configured credentials.
        </p>
      </div>

      <ModelPreferencesTable
        preferences={preferences}
        activeKeys={activeKeys}
        onPreferenceChange={updatePreference}
        loading={isLoading}
      />
    </div>
  );
}
