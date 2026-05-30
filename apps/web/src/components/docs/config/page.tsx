"use client";

import React from "react";
import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { Settings, ShieldCheck, ArrowRight, Code, FileText, Cpu } from "lucide-react";

export default function ConfigPage() {
  return (
    <ScrollReveal className="space-y-12 selection:bg-[#FFFDF9] selection:text-black">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-[#FFFDF9]/40 select-none pointer-events-none">
        <span>Core</span>
        <ArrowRight className="h-3 w-3 opacity-30" />
        <span className="text-[#FFFDF9]/80">Configuration</span>
      </div>

      <header className="space-y-4 border-b border-[#FFFDF9]/10 pb-8">
        <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-[#FFFDF9]">
          System Parameters.
        </h1>
        <p className="font-body text-base font-light leading-relaxed text-[#FFFDF9]/60 max-w-2xl">
          Configure your environment variables, API keys, and agent constraints to tailor swiftClaw to your specific development workflow.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-[#FFFDF9]/10 bg-[#0A0A0A]/60 p-6 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#FFFDF9]/10 to-transparent" />
          <Settings className="h-5 w-5 text-[#FFFDF9] mb-4 opacity-70 group-hover:opacity-100 transition-opacity" />
          <h3 className="font-display text-lg font-bold text-[#FFFDF9] mb-2">.swiftclawrc</h3>
          <p className="font-body text-xs font-light leading-relaxed text-[#FFFDF9]/50">
            The primary configuration file located in your home directory. Define default modes, preferred LLM providers, and workspace ignore patterns.
          </p>
        </div>
        <div className="rounded-2xl border border-[#FFFDF9]/10 bg-[#0A0A0A]/60 p-6 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#FFFDF9]/10 to-transparent" />
          <ShieldCheck className="h-5 w-5 text-[#FFFDF9] mb-4 opacity-70 group-hover:opacity-100 transition-opacity" />
          <h3 className="font-display text-lg font-bold text-[#FFFDF9] mb-2">Security Overrides</h3>
          <p className="font-body text-xs font-light leading-relaxed text-[#FFFDF9]/50">
            Strictly define which directories are read-only and which are permitted for staging. a-priori security constraints prevent accidental leaks of sensitive .env files.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#FFFDF9]/40 select-none pointer-events-none">
          <Code className="h-3 w-3" />
          <span>Environment Variables</span>
        </div>
        <div className="relative overflow-hidden rounded-xl border border-[#FFFDF9]/15 bg-[#050505] p-5 font-mono text-xs sm:text-sm text-[#FFFDF9] space-y-2">
          <div className="flex gap-4">
            <span className="text-[#FFFDF9]/30">SWIFTCLAW_API_KEY=</span>
            <span className="text-[#FFFDF9]/60">your_secret_key_here</span>
          </div>
          <div className="flex gap-4">
            <span className="text-[#FFFDF9]/30">SWIFTCLAW_MODE=</span>
            <span className="text-[#FFFDF9]/60">staging | plan | ask</span>
          </div>
          <div className="flex gap-4">
            <span className="text-[#FFFDF9]/30">SWIFTCLAW_LOG_LEVEL=</span>
            <span className="text-[#FFFDF9]/60">debug | info | warn | error</span>
          </div>
        </div>
      </section>

      <blockquote className="border-l border-[#FFFDF9]/30 bg-[#FFFDF9]/[0.02] p-4 rounded-r-xl">
        <p className="font-body text-xs font-light italic leading-relaxed text-[#FFFDF9]/60">
          "Configuration tip: Use project-specific .swiftclaw files in the root of your repo to override global settings for a specific codebase."
        </p>
      </blockquote>
    </ScrollReveal>
  );
}
