"use client";

import React from "react";
import { UsageSummary } from "@/components/settings/UsageSummary";

export default function UsageSettingsPage() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Page header */}
      <div className="border-b border-white/5 pb-4">
        <h2 className="text-sm font-semibold text-sc-text uppercase tracking-wider">
          Token Budget Summary
        </h2>
        <p className="text-[10px] text-sc-text-muted mt-1 leading-normal">
          Inspect approximate volume allocations and metrics per LLM client key.
        </p>
      </div>

      <UsageSummary />
    </div>
  );
}
