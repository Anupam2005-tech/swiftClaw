"use client";

import React, { useState } from "react";
import { Source } from "../../lib/types/conversation";
import { FileText, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface SourcesPanelProps {
  sources: Source[];
}

export function SourcesPanel({ sources }: SourcesPanelProps) {
  const [expanded, setExpanded] = useState(false);

  if (sources.length === 0) return null;

  return (
    <div className="mt-4 border-t border-white/5 pt-3 w-full">
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-[10px] text-sc-text-muted/60 hover:text-sc-text cursor-pointer select-none font-semibold uppercase tracking-wider mb-2"
      >
        <span>Grounded Sources ({sources.length})</span>
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </div>

      {/* Citations Grid */}
      <div
        className={cn(
          "grid grid-cols-1 sm:grid-cols-2 gap-2 transition-all duration-300",
          expanded ? "max-h-[300px] overflow-y-auto pr-1 scrollbar-none" : "max-h-[36px] overflow-hidden"
        )}
      >
        {sources.map((source, idx) => (
          <div
            key={`${source.filename}-${idx}`}
            className="flex flex-col gap-1.5 p-2 rounded border border-white/5 bg-white/[0.005] text-[11px]"
          >
            <div className="flex items-center justify-between font-mono text-[9px] text-sc-text-muted/70">
              <span className="flex items-center gap-1.5 font-semibold text-sc-text truncate max-w-[150px]">
                <FileText className="h-3 w-3 shrink-0 text-sc-text-muted/50" />
                {source.filename}
              </span>
              {source.page !== undefined && (
                <span className="shrink-0 bg-white/5 px-1.5 py-0.5 rounded font-mono">
                  Page {source.page}
                </span>
              )}
            </div>
            
            {expanded && (
              <p className="text-[10px] text-sc-text-muted leading-relaxed font-sans bg-black/40 border border-white/[0.03] p-1.5 rounded mt-1 italic whitespace-normal">
                "{source.snippet}"
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
export default SourcesPanel;
