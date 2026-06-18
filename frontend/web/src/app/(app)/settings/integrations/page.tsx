"use client";

import React from "react";
import { IntegrationsGrid } from "@/components/settings/IntegrationsGrid";
import { useIntegrations } from "@/lib/hooks/useIntegrations";

export default function IntegrationsSettingsPage() {
  const { integrations, loading, toggleIntegration } = useIntegrations();

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Pane header */}
      <div className="border-b border-white/5 pb-4">
        <h2 className="text-sm font-semibold text-sc-text uppercase tracking-wider">
          MCP Integrations
        </h2>
        <p className="text-[10px] text-sc-text-muted mt-1 leading-normal">
          Connect your local or cloud services to the model context protocol (MCP) server.
        </p>
      </div>

      <IntegrationsGrid
        integrations={integrations}
        onToggle={toggleIntegration}
        loading={loading}
      />
    </div>
  );
}
