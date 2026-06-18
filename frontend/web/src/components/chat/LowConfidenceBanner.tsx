"use client";

import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "../ui/button";

interface LowConfidenceBannerProps {
  confidence: number;
  message: string;
  onRegenerate: () => void;
}

export function LowConfidenceBanner({
  confidence,
  message,
  onRegenerate,
}: LowConfidenceBannerProps) {
  const percent = Math.round(confidence * 100);

  return (
    <div className="mt-4 p-4 rounded-lg border border-yellow-500/10 bg-yellow-500/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs select-none">
      <div className="flex gap-3 items-start">
        <AlertCircle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-yellow-500 uppercase tracking-wider text-[10px]">
            Low Confidence Score ({percent}%)
          </span>
          <p className="text-sc-text-muted leading-relaxed max-w-[450px]">
            {message}
          </p>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onRegenerate}
        className="self-start sm:self-center shrink-0 border-yellow-500/20 hover:bg-yellow-500/10 hover:text-yellow-400 text-yellow-500 text-xs font-semibold h-8 cursor-pointer"
      >
        <RotateCcw className="h-3 w-3 mr-1.5" />
        Regenerate
      </Button>
    </div>
  );
}
export default LowConfidenceBanner;
