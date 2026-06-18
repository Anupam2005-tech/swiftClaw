"use client";

import React from "react";
import { ApiKeyList } from "@/components/settings/ApiKeyList";
import { ApiKeyForm } from "@/components/settings/ApiKeyForm";
import { useApiKeys } from "@/lib/hooks/useApiKeys";

export default function ApiKeysSettingsPage() {
  const { keys, loading, addKey, updateKey, removeKey } = useApiKeys();

  const existingKeys = keys.map((k) => k.provider);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Pane title */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h2 className="text-sm font-semibold text-sc-text uppercase tracking-wider">
            API Keys Vault
          </h2>
          <p className="text-[10px] text-sc-text-muted mt-1 leading-normal">
            Securely manage your developer API credentials. Keys are parsed locally on validation.
          </p>
        </div>
        
        {/* Add key action */}
        <ApiKeyForm onAddKey={addKey} existingKeys={existingKeys} loading={loading} />
      </div>

      {/* Keys List grid */}
      <ApiKeyList keys={keys} onRemove={removeKey} onUpdateKey={updateKey} loading={loading} />
    </div>
  );
}
