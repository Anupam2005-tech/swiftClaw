"use client";

import React from "react";
import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { Terminal, ArrowRight, CheckCircle, Copy, Check } from "lucide-react";
import { useState } from "react";

export default function CmdInstallPage() {
  const [copied, setCopied] = useState(false);
  const installCmd = "curl -fsSL https://swiftclaw.dev/install.sh | bash";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(installCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ScrollReveal className="space-y-12 selection:bg-[#FFFDF9] selection:text-black">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-[#FFFDF9]/40 select-none pointer-events-none">
        <span>Deployment</span>
        <ArrowRight className="h-3 w-3 opacity-30" />
        <span className="text-[#FFFDF9]/80">CMD / One-Liner</span>
      </div>

      <header className="space-y-4 border-b border-[#FFFDF9]/10 pb-8">
        <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-[#FFFDF9]">
          Rapid Deployment.
        </h1>
        <p className="font-body text-base font-light leading-relaxed text-[#FFFDF9]/60 max-w-2xl">
          The fastest way to get swiftClaw running on any Unix-like system. A single command handles binary fetching, path configuration, and initial setup.
        </p>
      </header>

      <section className="space-y-4">
        <div className="relative overflow-hidden rounded-xl border border-[#FFFDF9]/15 bg-[#050505] p-5 flex items-center justify-between group">
          <div className="flex items-center gap-4 font-mono text-xs sm:text-sm overflow-x-auto whitespace-nowrap scrollbar-none pr-12 text-[#FFFDF9]">
            <span className="text-[#FFFDF9]/30 select-none">$</span>
            <span>{installCmd}</span>
          </div>
          <button
            onClick={handleCopy}
            className="absolute right-4 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-lg border border-[#FFFDF9]/10 bg-[#FFFDF9]/5 text-[#FFFDF9]/40 backdrop-blur-md transition-all hover:border-[#FFFDF9]/30 hover:bg-[#FFFDF9]/10 hover:text-[#FFFDF9]"
            aria-label="Copy installation script"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-[#FFFDF9]" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-[#FFFDF9]/10 bg-[#0A0A0A]/60 p-6 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#FFFDF9]/10 to-transparent" />
          <CheckCircle className="h-5 w-5 text-[#FFFDF9] mb-4 opacity-70 group-hover:opacity-100 transition-opacity" />
          <h3 className="font-display text-lg font-bold text-[#FFFDF9] mb-2">Automatic Pathing</h3>
          <p className="font-body text-xs font-light leading-relaxed text-[#FFFDF9]/50">
            The script automatically detects your shell (zsh, bash, fish) and appends the necessary binary paths to your config file.
          </p>
        </div>
        <div className="rounded-2xl border border-[#FFFDF9]/10 bg-[#0A0A0A]/60 p-6 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#FFFDF9]/10 to-transparent" />
          <Terminal className="h-5 w-5 text-[#FFFDF9] mb-4 opacity-70 group-hover:opacity-100 transition-opacity" />
          <h3 className="font-display text-lg font-bold text-[#FFFDF9] mb-2">Dependency Check</h3>
          <p className="font-body text-xs font-light leading-relaxed text-[#FFFDF9]/50">
            Before installation, swiftClaw verifies your system meets the minimum requirements for the sandboxed runtime.
          </p>
        </div>
      </section>

      <blockquote className="border-l border-[#FFFDF9]/30 bg-[#FFFDF9]/[0.02] p-4 rounded-r-xl">
        <p className="font-body text-xs font-light italic leading-relaxed text-[#FFFDF9]/60">
          "Security Note: Always review third-party scripts before piping them into bash. You can view our install.sh source on GitHub."
        </p>
      </blockquote>
    </ScrollReveal>
  );
}
