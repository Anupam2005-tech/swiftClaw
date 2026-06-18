import React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  progress: number; // 0 to 100
  className?: string;
}

export function ProgressBar({ progress, className }: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, progress));

  return (
    <div className={cn("w-full h-1.5 bg-secondary rounded-full overflow-hidden border border-white/5", className)}>
      <div
        className="h-full bg-sc-accent transition-all duration-500 ease-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
