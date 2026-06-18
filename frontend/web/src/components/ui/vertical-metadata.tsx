"use client";

import { usePathname } from "next/navigation";

export function VerticalMetadata() {
  const pathname = usePathname();
  
  if (pathname?.startsWith("/docs")) {
    return null;
  }

  return (
    <div className="pointer-events-none">
      <div className="hidden md:block fixed left-0 top-1/2 z-20 -translate-y-1/2 px-4">
        <div className="origin-left -rotate-90 uppercase tracking-[0.25em] text-[10px] text-sc-text-muted/30 font-mono select-none">
          SWIFTCLAW_ENGINE_v1.0
        </div>
      </div>
      <div className="hidden md:block fixed right-0 top-1/2 z-20 -translate-y-1/2 px-4">
        <div className="origin-left rotate-90 uppercase tracking-[0.25em] text-[10px] text-sc-text-muted/30 font-mono select-none">
          SWIFTCLAW_ENGINE_v1.0
        </div>
      </div>
    </div>
  );
}
