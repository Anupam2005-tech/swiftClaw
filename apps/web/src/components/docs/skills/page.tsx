"use client";

import React from "react";
import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { Brain, Puzzle, ArrowRight, Zap, Cpu, Terminal } from "lucide-react";

export default function SkillsPage() {
  return (
    <ScrollReveal className="space-y-12 selection:bg-[#FFFDF9] selection:text-black">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-[#FFFDF9]/40 select-none pointer-events-none">
        <span>Core</span>
        <ArrowRight className="h-3 w-3 opacity-30" />
        <span className="text-[#FFFDF9]/80">Agent Skills</span>
      </div>

      <header className="space-y-4 border-b border-[#FFFDF9]/10 pb-8">
        <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-[#FFFDF9]">
          Extensible Intelligence.
        </h1>
        <p className="font-body text-base font-light leading-relaxed text-[#FFFDF9]/60 max-w-2xl">
          Skills are modular capabilities that extend the agent's cognitive reach, allowing it to perform specialized tasks across different environments.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-[#FFFDF9]/10 bg-[#0A0A0A]/60 p-6 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#FFFDF9]/10 to-transparent" />
          <Puzzle className="h-5 w-5 text-[#FFFDF9] mb-4 opacity-70 group-hover:opacity-100 transition-opacity" />
          <h3 className="font-display text-lg font-bold text-[#FFFDF9] mb-2">Custom Skillsets</h3>
          <p className="font-body text-xs font-light leading-relaxed text-[#FFFDF9]/50">
            Define your own skills using simple YAML definitions or TypeScript scripts. Teach the agent how to interact with internal APIs or proprietary tools.
          </p>
        </div>
        <div className="rounded-2xl border border-[#FFFDF9]/10 bg-[#0A0A0A]/60 p-6 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#FFFDF9]/10 to-transparent" />
          <Brain className="h-5 w-5 text-[#FFFDF9] mb-4 opacity-70 group-hover:opacity-100 transition-opacity" />
          <h3 className="font-display text-lg font-bold text-[#FFFDF9] mb-2">Adaptive Learning</h3>
          <p className="font-body text-xs font-light leading-relaxed text-[#FFFDF9]/50">
            Skills are context-aware. The agent automatically selects the most appropriate skill based on the detected file extensions and workspace markers.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#FFFDF9]/40 select-none pointer-events-none">
          <Cpu className="h-3 w-3" />
          <span>Default Skill Matrix</span>
        </div>
        <div className="relative overflow-hidden rounded-xl border border-[#FFFDF9]/15 bg-[#050505] p-5 font-mono text-xs sm:text-sm text-[#FFFDF9] space-y-4">
          <div className="flex justify-between items-center p-2 rounded-lg bg-[#FFFDF9]/5 border border-[#FFFDF9]/5">
            <span className="font-bold">Filesystem Architect</span>
            <span className="text-[10px] text-[#FFFDF9]/40 uppercase">Active</span>
          </div>
          <div className="flex justify-between items-center p-2 rounded-lg bg-[#FFFDF9]/5 border border-[#FFFDF9]/5">
            <span className="font-bold">Git Historian</span>
            <span className="text-[10px] text-[#FFFDF9]/40 uppercase">Active</span>
          </div>
          <div className="flex justify-between items-center p-2 rounded-lg bg-[#FFFDF9]/5 border border-[#FFFDF9]/5">
            <span className="font-bold">Dependency Auditor</span>
            <span className="text-[10px] text-[#FFFDF9]/40 uppercase">Active</span>
          </div>
          <div className="flex justify-between items-center p-2 rounded-lg bg-[#FFFDF9]/5 border border-[#FFFDF9]/5">
            <span className="font-bold">Regex Wizard</span>
            <span className="text-[10px] text-[#FFFDF9]/40 uppercase">Active</span>
          </div>
        </div>
      </section>

      <blockquote className="border-l border-[#FFFDF9]/30 bg-[#FFFDF9]/[0.02] p-4 rounded-r-xl">
        <p className="font-body text-xs font-light italic leading-relaxed text-[#FFFDF9]/60">
          "Insight: Skill definitions are stored in ~/.swiftclaw/skills. You can share skillsets between team members via simple JSON export/import."
        </p>
      </blockquote>
    </ScrollReveal>
  );
}
