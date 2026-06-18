"use client";

import React from "react";
import { ProgressBar } from "../ui/progress-bar";
import { PROVIDERS } from "../onboarding/ProviderSelectionStep";
import { Coins, Flame, Info } from "lucide-react";

interface UsageItem {
  provider: string;
  tokensToday: number;
  tokensMonth: number;
  monthlyLimit: number;
}

const MOCK_USAGE: UsageItem[] = [
  { provider: "claude", tokensToday: 12400, tokensMonth: 234500, monthlyLimit: 500000 },
  { provider: "gemini", tokensToday: 4500, tokensMonth: 120800, monthlyLimit: 1000000 },
  { provider: "openai", tokensToday: 8200, tokensMonth: 89400, monthlyLimit: 300000 },
  { provider: "groq", tokensToday: 35000, tokensMonth: 412000, monthlyLimit: 2000000 },
];

export function UsageSummary() {
  const getProviderName = (id: string) => {
    return PROVIDERS.find((p) => p.id === id)?.name || id;
  };

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div className="flex flex-col gap-6 text-xs select-none">
      {/* Overview stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border border-white/5 bg-white/[0.005] rounded-lg flex flex-col gap-1">
          <span className="text-sc-text-muted/60 text-[9px] uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <Coins className="h-3 w-3 text-sc-text-muted" />
            Tokens Consumed (Today)
          </span>
          <span className="text-lg font-bold text-sc-text font-mono">60,100</span>
        </div>

        <div className="p-4 border border-white/5 bg-white/[0.005] rounded-lg flex flex-col gap-1">
          <span className="text-sc-text-muted/60 text-[9px] uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <Flame className="h-3 w-3 text-sc-accent animate-pulse" />
            Active Vault Connections
          </span>
          <span className="text-lg font-bold text-sc-text font-mono">{MOCK_USAGE.length}</span>
        </div>
      </div>

      {/* Progress list */}
      <div className="flex flex-col gap-5 border-t border-white/5 pt-4">
        <h3 className="text-xs font-semibold text-sc-text uppercase tracking-wider">
          Provider Details
        </h3>

        <div className="flex flex-col gap-4">
          {MOCK_USAGE.map((item) => {
            const ratio = (item.tokensMonth / item.monthlyLimit) * 100;
            return (
              <div key={item.provider} className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-semibold text-sc-text">
                    {getProviderName(item.provider)}
                  </span>
                  <div className="text-[10px] text-sc-text-muted/70 font-mono">
                    <span className="text-sc-text font-bold">
                      {formatNumber(item.tokensMonth)}
                    </span>{" "}
                    / {formatNumber(item.monthlyLimit)} limit
                  </div>
                </div>

                <ProgressBar progress={ratio} className="h-2" />

                <div className="flex justify-between text-[9px] text-sc-text-muted/40 font-mono mt-0.5">
                  <span>Today: {formatNumber(item.tokensToday)} tokens</span>
                  <span>{Math.round(ratio)}% of monthly budget</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Notice */}
      <div className="p-3.5 rounded-lg border border-white/5 bg-white/[0.002] flex gap-2.5 items-start text-[10px] text-sc-text-muted/70 mt-2">
        <Info className="h-4 w-4 shrink-0 text-sc-text-muted/40 mt-0.5" />
        <p className="leading-relaxed">
          Usage values are tracked locally using model context metadata. These metrics are approximate guidelines. Consult your provider consoles directly to audit precise pricing details.
        </p>
      </div>
    </div>
  );
}
export default UsageSummary;
