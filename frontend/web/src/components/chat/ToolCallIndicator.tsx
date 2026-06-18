"use client";

import React, { useState } from "react";
import { ToolCall } from "../../lib/types/conversation";
import { Play, CheckCircle2, XCircle, ChevronDown, ChevronUp, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolCallIndicatorProps {
  toolCall: ToolCall;
}

export function ToolCallIndicator({ toolCall }: ToolCallIndicatorProps) {
  const [expanded, setExpanded] = useState(false);

  const getToolDisplayName = (name: string) => {
    switch (name) {
      case "brave_search":
        return "Brave Internet Search";
      case "image_generator":
        return "Visual Synthesis Engine";
      default:
        return name;
    }
  };

  const isPending = toolCall.status === "pending";
  const isSuccess = toolCall.status === "success";
  const isError = toolCall.status === "error";

  return (
    <div className="my-2.5 rounded-lg border border-white/5 bg-black/30 overflow-hidden text-xs">
      {/* Header bar */}
      <div
        onClick={() => !isPending && setExpanded(!expanded)}
        className={cn(
          "flex items-center justify-between px-3 py-2 cursor-pointer select-none",
          !isPending && "hover:bg-white/[0.02]"
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Terminal className="h-3.5 w-3.5 text-sc-text-muted shrink-0" />
          
          {/* Status Icon & Message */}
          {isPending && (
            <div className="flex items-center gap-2 text-sc-text-muted/80">
              <span className="h-2 w-2 rounded-full bg-sc-accent animate-ping shrink-0" />
              <span className="font-mono truncate">Executing {getToolDisplayName(toolCall.tool)}...</span>
            </div>
          )}
          
          {isSuccess && (
            <div className="flex items-center gap-2 text-sc-text-muted/90">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0" />
              <span className="font-mono font-medium truncate">
                {getToolDisplayName(toolCall.tool)} completed
              </span>
            </div>
          )}

          {isError && (
            <div className="flex items-center gap-2 text-red-400 font-medium">
              <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
              <span className="font-mono truncate">
                {getToolDisplayName(toolCall.tool)} failed
              </span>
            </div>
          )}
        </div>

        {/* Toggle details indicator */}
        {!isPending && (
          <button className="text-sc-text-muted/60 p-0.5 hover:text-sc-text cursor-pointer">
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>

      {/* Expanded details */}
      {expanded && !isPending && (
        <div className="border-t border-white/5 bg-black/60 p-3 flex flex-col gap-2.5 font-mono text-[10px] text-sc-text-muted/80 leading-normal">
          {/* Call Arguments */}
          <div>
            <span className="text-sc-text/40 block uppercase tracking-wider text-[8px] font-bold mb-1">
              Parameters
            </span>
            <pre className="bg-white/[0.01] border border-white/5 p-2 rounded max-h-[100px] overflow-y-auto pr-1">
              {JSON.stringify(toolCall.args, null, 2)}
            </pre>
          </div>

          {/* Response Payload */}
          {toolCall.result && (
            <div>
              <span className="text-sc-text/40 block uppercase tracking-wider text-[8px] font-bold mb-1">
                Result Payload
              </span>
              <pre className="bg-white/[0.01] border border-white/5 p-2 rounded max-h-[150px] overflow-y-auto whitespace-pre-wrap break-all pr-1">
                {toolCall.result}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export default ToolCallIndicator;
