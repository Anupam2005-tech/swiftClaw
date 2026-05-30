"use client";

import React from "react";
import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { Apple, ArrowRight, CheckCircle, Download, Terminal } from "lucide-react";

export default function MacInstallPage() {
  return (
    <ScrollReveal className="space-y-12 selection:bg-[#FFFDF9] selection:text-black">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-[#FFFDF9]/40 select-none pointer-events-none">
        <span>Deployment</span>
        <ArrowRight className="h-3 w-3 opacity-30" />
        <span className="text-[#FFFDF9]/80">macOS Binary</span>
      </div>

      <header className="space-y-4 border-b border-[#FFFDF9]/10 pb-8">
        <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-[#FFFDF9]">
          Apple Silicon Ready.
        </h1>
        <p className="font-body text-base font-light leading-relaxed text-[#FFFDF9]/60 max-w-2xl">
          Optimized for M1, M2, and M3 architectures. Experience native performance with full integration into macOS terminal environments.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-[#FFFDF9]/10 bg-[#0A0A0A]/60 p-6 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#FFFDF9]/10 to-transparent" />
          <Apple className="h-5 w-5 text-[#FFFDF9] mb-4 opacity-70 group-hover:opacity-100 transition-opacity" />
          <h3 className="font-display text-lg font-bold text-[#FFFDF9] mb-2">Native Binary</h3>
          <p className="font-body text-xs font-light leading-relaxed text-[#FFFDF9]/50">
            We provide pre-compiled binaries for ARM64, eliminating the need for Rosetta 2 and maximizing energy efficiency.
          </p>
        </div>
        <div className="rounded-2xl border border-[#FFFDF9]/10 bg-[#0A0A0A]/60 p-6 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#FFFDF9]/10 to-transparent" />
          <Download className="h-5 w-5 text-[#FFFDF9] mb-4 opacity-70 group-hover:opacity-100 transition-opacity" />
          <h3 className="font-display text-lg font-bold text-[#FFFDF9] mb-2">Homebrew Support</h3>
          <p className="font-body text-xs font-light leading-relaxed text-[#FFFDF9]/50">
            Prefer package managers? Install swiftClaw via Homebrew for easier updates and dependency management.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#FFFDF9]/40 select-none pointer-events-none">
          <Terminal className="h-3 w-3" />
          <span>Installation Step</span>
        </div>
        <div className="relative overflow-hidden rounded-xl border border-[#FFFDF9]/15 bg-[#050505] p-5 font-mono text-xs sm:text-sm text-[#FFFDF9]">
          <div className="flex gap-4">
            <span className="text-[#FFFDF9]/30 select-none">$</span>
            <span>brew install swiftclaw/tap/swiftclaw</span>
          </div>
        </div>
      </section>

      <blockquote className="border-l border-[#FFFDF9]/30 bg-[#FFFDF9]/[0.02] p-4 rounded-r-xl">
        <p className="font-body text-xs font-light italic leading-relaxed text-[#FFFDF9]/60">
          "macOS User Note: You may need to allow the binary to run in System Settings &gt; Privacy &amp; Security if you are installing via direct download."
        </p>
      </blockquote>
    </ScrollReveal>
  );
}
