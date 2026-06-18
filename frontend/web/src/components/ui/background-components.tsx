"use client";

import { cn } from "@/lib/utils";

export function GlobalBackground({ className }: { className?: string }) {
  return (
    <div
      className={cn("pointer-events-none fixed inset-0 z-0 bg-background", className)}
      aria-hidden
    >
      <div
        className="absolute inset-0"
        style={{
          animation: "sc-glow-pulse 6s ease-in-out infinite",
          background: `
            radial-gradient(ellipse 70% 55% at 50% -10%, rgba(255, 92, 77, 0.1), transparent 55%),
            radial-gradient(ellipse 50% 40% at 80% 60%, rgba(255, 92, 77, 0.06), transparent 50%),
            radial-gradient(ellipse 45% 35% at 15% 80%, rgba(248, 247, 251, 0.04), transparent 45%)
          `,
        }}
      />
    </div>
  );
}

export const Component = GlobalBackground;
