"use client";

import React from "react";
import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { Terminal, Shield, ArrowRight, Cpu, Key, Copy, Check } from "lucide-react";
import { useState } from "react";

export default function IntroPage() {
  const [copied, setCopied] = useState(false);
  const installCmd = "curl -fsSL https://swiftclaw.dev/install.sh | bash";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(installCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ScrollReveal className="space-y-12 selection:bg-[#FFFDF9] selection:text-black">
      
      {/* --- BREADCRUMBS & CORE METADATA --- */}
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-[#FFFDF9]/40 select-none pointer-events-none">
        <span>Core</span>
        <ArrowRight className="h-3 w-3 opacity-30" />
        <span className="text-[#FFFDF9]/80">Introduction</span>
      </div>

      {/* --- HERO HEADER CONSOLE --- */}
      <header className="space-y-4 border-b border-[#FFFDF9]/10 pb-8">
        <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-[#FFFDF9]">
          The Autonomous Gateway.
        </h1>
        <p className="font-body text-base font-light leading-relaxed text-[#FFFDF9]/60 max-w-2xl">
          swiftClaw is a secure, local-first terminal agent built to handle complex migrations, 
          repository auditing, and codebase exploration while maintaining human clearance constraints.
        </p>
      </header>

      {/* --- CORE PILLARS MATRIX --- */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Pillar 1 */}
        <div className="rounded-2xl border border-[#FFFDF9]/10 bg-[#0A0A0A]/60 p-6 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#FFFDF9]/10 to-transparent" />
          <Shield className="h-5 w-5 text-[#FFFDF9] mb-4 opacity-70 group-hover:opacity-100 transition-opacity" />
          <h3 className="font-display text-lg font-bold text-[#FFFDF9] mb-2">Zero-Trust Buffer</h3>
          <p className="font-body text-xs font-light leading-relaxed text-[#FFFDF9]/50">
            Every filesystem mutation proposed by the agent is compiled inside an isolated virtual staging area. Your live production directories remain completely untouched until you physically authenticate the payload.
          </p>
        </div>

        {/* Pillar 2 */}
        <div className="rounded-2xl border border-[#FFFDF9]/10 bg-[#0A0A0A]/60 p-6 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#FFFDF9]/10 to-transparent" />
          <Cpu className="h-5 w-5 text-[#FFFDF9] mb-4 opacity-70 group-hover:opacity-100 transition-opacity" />
          <h3 className="font-display text-lg font-bold text-[#FFFDF9] mb-2">Dual Cognitive Modes</h3>
          <p className="font-body text-xs font-light leading-relaxed text-[#FFFDF9]/50">
            Toggle between <span className="text-[#FFFDF9] font-medium">Plan Mode</span> to map complex structural architectures across microservices, or <span className="text-[#FFFDF9] font-medium">Ask Mode</span> to execute structural, completely read-only system queries.
          </p>
        </div>

      </section>

      {/* --- QUICK START CONTAINER --- */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#FFFDF9]/40 select-none pointer-events-none">
          <Key className="h-3 w-3" />
          <span>Quick Initialization</span>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-[#FFFDF9]/15 bg-[#050505] p-5 flex items-center justify-between group">
          <div className="flex items-center gap-4 font-mono text-xs sm:text-sm overflow-x-auto whitespace-nowrap scrollbar-none pr-12 text-[#FFFDF9]">
            <span className="text-[#FFFDF9]/30 select-none">$</span>
            <span>{installCmd}</span>
          </div>

          <button
            onClick={handleCopy}
            className="absolute right-4 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-lg border border-[#FFFDF9]/10 bg-[#FFFDF9]/5 text-[#FFFDF9]/40 backdrop-blur-md transition-all hover:border-[#FFFDF9]/30 hover:bg-[#FFFDF9]/10 hover:text-[#FFFDF9]"
            aria-label="Copy shell script"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-[#FFFDF9]" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      </section>

      {/* --- ARCHITECTURAL NOTE --- */}
      <blockquote className="border-l border-[#FFFDF9]/30 bg-[#FFFDF9]/[0.02] p-4 rounded-r-xl">
        <p className="font-body text-xs font-light italic leading-relaxed text-[#FFFDF9]/60">
          "System Notice: swiftClaw operates purely within local workspace runtimes. It maps context schemas locally and contacts upstream inference engines exclusively via user-provided keys."
        </p>
      </blockquote>

    </ScrollReveal>
  );
}