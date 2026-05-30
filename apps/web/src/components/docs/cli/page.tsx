"use client";

import React from "react";
import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { Terminal, Zap, ArrowRight, Command, Cpu, List } from "lucide-react";

export default function CliPage() {
  return (
    <ScrollReveal className="space-y-12 selection:bg-[#FFFDF9] selection:text-black">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-[#FFFDF9]/40 select-none pointer-events-none">
        <span>Core</span>
        <ArrowRight className="h-3 w-3 opacity-30" />
        <span className="text-[#FFFDF9]/80">CLI Reference</span>
      </div>

      <header className="space-y-4 border-b border-[#FFFDF9]/10 pb-8">
        <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-[#FFFDF9]">
          Terminal Interface.
        </h1>
        <p className="font-body text-base font-light leading-relaxed text-[#FFFDF9]/60 max-w-2xl">
          A comprehensive reference for the swiftClaw command line utility. From rapid querying to complex workspace orchestration.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-[#FFFDF9]/10 bg-[#0A0A0A]/60 p-6 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#FFFDF9]/10 to-transparent" />
          <Zap className="h-5 w-5 text-[#FFFDF9] mb-4 opacity-70 group-hover:opacity-100 transition-opacity" />
          <h3 className="font-display text-lg font-bold text-[#FFFDF9] mb-2">Instant Execution</h3>
          <p className="font-body text-xs font-light leading-relaxed text-[#FFFDF9]/50">
            Execute one-off commands without entering the interactive shell. Pass prompts directly to the agent for rapid iterations.
          </p>
        </div>
        <div className="rounded-2xl border border-[#FFFDF9]/10 bg-[#0A0A0A]/60 p-6 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#FFFDF9]/10 to-transparent" />
          <Command className="h-5 w-5 text-[#FFFDF9] mb-4 opacity-70 group-hover:opacity-100 transition-opacity" />
          <h3 className="font-display text-lg font-bold text-[#FFFDF9] mb-2">Interactive Shell</h3>
          <p className="font-body text-xs font-light leading-relaxed text-[#FFFDF9]/50">
            Enter the full-blown interactive environment for multi-step planning and real-time feedback loops with the agent.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#FFFDF9]/40 select-none pointer-events-none">
          <List className="h-3 w-3" />
          <span>Primary Commands</span>
        </div>
        <div className="relative overflow-hidden rounded-xl border border-[#FFFDF9]/15 bg-[#050505] p-5 font-mono text-xs sm:text-sm text-[#FFFDF9] space-y-4">
          <div className="space-y-1">
            <div className="flex gap-2">
              <span className="text-[#FFFDF9] font-bold">swiftclaw ask "..."</span>
              <span className="text-[#FFFDF9]/40">— Read-only system query</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex gap-2">
              <span className="text-[#FFFDF9] font-bold">swiftclaw plan "..."</span>
              <span className="text-[#FFFDF9]/40">— Map proposed changes to staging</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex gap-2">
              <span className="text-[#FFFDF9] font-bold">swiftclaw apply</span>
              <span className="text-[#FFFDF9]/40">— Commit staged changes to live disk</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex gap-2">
              <span className="text-[#FFFDF9] font-bold">swiftclaw status</span>
              <span className="text-[#FFFDF9]/40">— Inspect current staging diffs</span>
            </div>
          </div>
        </div>
      </section>

      <blockquote className="border-l border-[#FFFDF9]/30 bg-[#FFFDF9]/[0.02] p-4 rounded-r-xl">
        <p className="font-body text-xs font-light italic leading-relaxed text-[#FFFDF9]/60">
          "Pro Tip: Use the --dry-run flag with the 'plan' command to see a theoretical impact analysis without actually modifying the staging area."
        </p>
      </blockquote>
    </ScrollReveal>
  );
}
