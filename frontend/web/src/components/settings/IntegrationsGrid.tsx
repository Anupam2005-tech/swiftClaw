"use client";

import React from "react";
import { Integration, IntegrationId } from "../../lib/types/integration";
import { IntegrationCard } from "./IntegrationCard";
import { Spinner } from "../ui/spinner";

interface IntegrationsGridProps {
  integrations: Integration[];
  onToggle: (id: IntegrationId, enabled: boolean) => Promise<void>;
  loading: boolean;
}

export function IntegrationsGrid({ integrations, onToggle, loading }: IntegrationsGridProps) {
  if (loading && integrations.length === 0) {
    return (
      <div className="flex justify-center p-12 text-sc-text-muted/40">
        <Spinner size="md" className="border-t-transparent border-sc-text/40" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {integrations.map((integration) => (
        <IntegrationCard
          key={integration.id}
          integration={integration}
          onToggle={(enabled) => onToggle(integration.id, enabled)}
        />
      ))}
    </div>
  );
}
export default IntegrationsGrid;
