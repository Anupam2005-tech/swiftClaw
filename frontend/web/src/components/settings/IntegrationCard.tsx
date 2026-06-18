"use client";

import React, { useState } from "react";
import { Integration } from "../../lib/types/integration";
import { Cpu, RefreshCcw, Wifi, WifiOff } from "lucide-react";
import { Spinner } from "../ui/spinner";
import { cn } from "@/lib/utils";

interface IntegrationCardProps {
  integration: Integration;
  onToggle: (enabled: boolean) => Promise<void>;
}

export function IntegrationCard({ integration, onToggle }: IntegrationCardProps) {
  const [loading, setLoading] = useState(false);

  const handleToggleChange = async () => {
    setLoading(true);
    try {
      await onToggle(!integration.enabled);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const formatSyncTime = (isoString?: string) => {
    if (!isoString) return "";
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return "Just now";
      if (diffMins === 1) return "1 min ago";
      if (diffMins < 60) return `${diffMins} mins ago`;
      return new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return "";
    }
  };

  return (
    <div
      className={cn(
        "rounded-lg border p-4 flex flex-col justify-between h-[150px] transition-all relative overflow-hidden select-none",
        integration.enabled
          ? "border-sc-accent/40 bg-sc-accent/[0.01]"
          : "border-white/5 bg-black/20"
      )}
    >
      {/* Upper info */}
      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-sc-text truncate max-w-[150px] flex items-center gap-1.5">
            <Cpu className={cn("h-3.5 w-3.5", integration.enabled ? "text-sc-text" : "text-sc-text-muted/60")} />
            {integration.name}
          </span>

          {/* Connection status pill */}
          {integration.enabled ? (
            <span className="flex items-center gap-1 text-[8px] font-mono text-green-400 font-bold bg-green-500/10 px-1.5 py-0.5 rounded select-none">
              <Wifi className="h-2 w-2 stroke-[2.5]" />
              Active
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[8px] font-mono text-sc-text-muted/50 bg-white/5 px-1.5 py-0.5 rounded select-none">
              <WifiOff className="h-2 w-2" />
              Offline
            </span>
          )}
        </div>

        <p className="text-[10px] text-sc-text-muted/80 mt-1.5 leading-normal">
          {integration.description}
        </p>
      </div>

      {/* Bottom status and toggle */}
      <div className="flex items-center justify-between mt-3 border-t border-white/5 pt-2 px-0.5">
        <span className="text-[9px] font-mono text-sc-text-muted/40 truncate flex items-center gap-1">
          {integration.enabled && integration.last_synced_at && (
            <>
              <RefreshCcw className="h-2.5 w-2.5 text-sc-text-muted/30" />
              Sync: {formatSyncTime(integration.last_synced_at)}
            </>
          )}
        </span>

        {/* Toggle Button */}
        <button
          onClick={handleToggleChange}
          disabled={loading}
          className={cn(
            "text-[9px] uppercase tracking-widest font-semibold px-3 py-1 rounded transition-all cursor-pointer font-mono border",
            loading
              ? "opacity-50 cursor-wait bg-transparent border-white/10"
              : integration.enabled
              ? "bg-transparent hover:bg-red-500/10 hover:text-red-400 border-white/10 hover:border-red-500/20 text-sc-text"
              : "bg-sc-accent text-accent-foreground border-sc-accent hover:bg-sc-accent/90"
          )}
        >
          {loading ? <Spinner size="sm" className="border-t-transparent h-2.5 w-2.5 border" /> : integration.enabled ? "Disconnect" : "Connect"}
        </button>
      </div>
    </div>
  );
}
export default IntegrationCard;
