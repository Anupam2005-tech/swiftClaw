"use client";

import React from "react";
import { Cpu } from "lucide-react";

export default function IntegrationsSettingsPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-300">
      <div className="h-12 w-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 text-amber-400">
        <Cpu className="h-6 w-6 animate-pulse" />
      </div>
      <h2 className="text-sm font-semibold text-sc-text uppercase tracking-wider">
        MCP Integrations Coming Soon
      </h2>
      <p className="text-[10px] text-sc-text-muted mt-2 max-w-sm leading-normal">
        Connect your local or cloud services to the model context protocol (MCP) server. This feature is currently under development.
      </p>
    </div>
  );
}
