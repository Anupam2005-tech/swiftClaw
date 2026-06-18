import React from "react";
import { SettingsNav } from "@/components/settings/SettingsNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings — swiftClaw",
  description: "Manage your LLM credentials, preferences, MCP integrations, and active devices.",
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-4 md:p-8 bg-sc-canvas select-none scrollbar-none">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 md:gap-6">
        {/* Header Title */}
        <div className="border-b border-white/5 pb-3 md:pb-4 mb-1 md:mb-2">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-sc-text font-display">
            Settings <span className="font-serif italic font-normal text-sc-accent">Panel</span>
          </h1>
          <p className="text-[10px] md:text-xs text-sc-text-muted mt-1 leading-normal">
            Configure LLM credentials, adjust automated failovers, and review connected workspace sessions.
          </p>
        </div>

        {/* Panel Main Area */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-start">
          {/* Left Navigation - horizontal scroll on mobile, vertical sidebar on md+ */}
          <SettingsNav />

          {/* Right Sub-pane Workspace */}
          <div className="flex-1 min-w-0 w-full border border-white/5 bg-black/40 backdrop-blur-md rounded-xl p-4 md:p-6 shadow-xl relative overflow-hidden">
            {/* Top border neon line */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-sc-accent/20 to-transparent" />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
