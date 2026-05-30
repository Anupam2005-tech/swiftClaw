"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Terminal } from "lucide-react";
import { ScrollReveal, ScrollSection } from "@/components/landing/scroll-reveal";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

// Flattened, highly specific installation methods
const INSTALL_METHODS = [
  { id: "curl", label: "cURL", command: "curl -fsSL https://swiftclaw.online/install.sh | bash", comment: "# Universal shell script. Installs core binaries." },
  { id: "npm", label: "npm", command: "npm install -g swiftclaw", comment: "# Standard Node.js ecosystem global installation." },
  { id: "bun", label: "bun", command: "bun add -g swiftclaw", comment: "# Blazing fast edge-optimized runtime execution." },
  { id: "pnpm", label: "pnpm", command: "pnpm add -g swiftclaw", comment: "# Efficient, symlinked package manager installation." },
  { id: "mac", label: "macOS", command: "brew install swiftclaw", comment: "# Native macOS architecture via Homebrew." },
  { id: "linux", label: "Linux", command: "sudo apt-get install swiftclaw", comment: "# Debian/Ubuntu native APT package registry." },
  { id: "win", label: "Windows", command: "iwr -useb https://swiftclaw.online/install.ps1 | iex", comment: "# Windows PowerShell execution script." },
];

export function WhatIsSection() {
  const [activeMethod, setActiveMethod] = useState(INSTALL_METHODS[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <TooltipProvider>
    <ScrollSection id="what-is" className="relative px-4 py-32 sm:px-6 bg-[#000000] overflow-hidden isolate selection:bg-[#FFFDF9] selection:text-black">
      
      {/* --- PREMIUM AWARD-WINNING BACKGROUND ARCHITECTURE --- */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_60%,transparent_100%)] pointer-events-none" />
      
      {/* Structural Grid Lines */}
      <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-[#FFFDF9]/10 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-[#FFFDF9]/10 to-transparent pointer-events-none" />
      <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#FFFDF9]/10 to-transparent pointer-events-none" />
      
      {/* Ambient Orbs */}
      <div className="absolute top-0 right-0 -mr-64 -mt-32 h-[500px] w-[500px] rounded-full bg-[#FFFDF9] opacity-[0.015] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-64 -mb-32 h-[500px] w-[500px] rounded-full bg-[#FFFDF9] opacity-[0.015] blur-[120px] pointer-events-none" />

      {/* Decorative Crosshairs */}
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 text-[#FFFDF9]/20 font-mono text-[10px] pointer-events-none">+</div>
      <div className="absolute top-1/3 right-1/4 translate-x-1/2 -translate-y-1/2 text-[#FFFDF9]/20 font-mono text-[10px] pointer-events-none">+</div>

      <div className="mx-auto max-w-7xl relative z-10">
        
        {/* Micro-Typography Header */}
        <div className="pointer-events-none hidden md:flex justify-between mb-16 text-[9px] uppercase tracking-[0.25em] text-[#FFFDF9]/30 font-mono select-none">
          <span>SYS.VER // 1.0.0-STABLE</span>
          <span>MODE // ZERO-TRUST_STAGING</span>
        </div>
        
        {/* Core Headline Matrix */}
        <ScrollReveal className="max-w-4xl mb-24 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full border border-[#FFFDF9]/10 bg-[#FFFDF9]/[0.02] backdrop-blur-md">
            <Terminal className="w-3.5 h-3.5 text-[#FFFDF9]" />
            <span className="font-mono text-[10px] font-normal tracking-widest text-[#FFFDF9]/70 uppercase">Execution Model</span>
          </div>
          <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl font-light tracking-tighter text-[#FFFDF9] mb-8 leading-[1.1]">
            Autonomous execution. <br />
            <span className="text-[#FFFDF9]/40 font-normal">Human-in-the-loop control.</span>
          </h2>
          <p className="font-body text-lg font-light leading-relaxed text-[#FFFDF9]/50 max-w-2xl">
            swiftClaw operates as a sandboxed terminal intelligence. It explores your architecture, drafts multi-file patches, and stages them in memory. Nothing hits your disk until you explicitly approve the diff.
          </p>
        </ScrollReveal>

        {/* Asymmetric Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Block: Infinite Terminal Simulation (Span 7) */}
          <ScrollReveal 
            delay={0.1}
            className="lg:col-span-7 group relative overflow-hidden rounded-[32px] border border-[#FFFDF9]/10 bg-[#0A0A0A]/40 backdrop-blur-md min-h-[450px] flex p-1.5"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#FFFDF9]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <div className="relative w-full h-full rounded-[26px] bg-[#000000] overflow-hidden border border-[#FFFDF9]/5 flex flex-col">
              
              {/* Terminal Header */}
              <div className="h-14 w-full border-b border-[#FFFDF9]/10 flex items-center px-5 gap-3 bg-[#050505] z-10 relative">
                <div className="flex gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
                </div>
                <div className="flex-1 text-center font-mono text-[9px] uppercase tracking-widest text-[#FFFDF9]/40">swiftClaw Agent Loop</div>
              </div>
              
              {/* Integrated Image & Log Container */}
              <div className="flex-1 relative flex flex-col justify-end overflow-hidden bg-[#050505]">
                
                {/* Visual Image Area (Absolute Full Cover) */}
                <div className="absolute inset-0 z-0">
                  <img 
                    src="/swiftClaw.avif" 
                    alt="Agent visualization" 
                    className="w-full h-full object-cover opacity-50 hover:opacity-80 transition-opacity duration-700"
                  />
                  {/* Subtle scanline overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
                  
                  {/* Dark gradient fade from bottom to ensure text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#000000]/80 to-transparent pointer-events-none" />
                </div>

                {/* Log Area (Sits on top of the image) */}
                <div className="relative z-10 w-full p-6 sm:p-8 flex flex-col justify-end pointer-events-none">
                   <div className="font-mono text-xs sm:text-sm text-[#FFFDF9]/90 space-y-4 drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: [0, 1, 1, 0], y: [10, 0, 0, -10] }}
                        transition={{ duration: 5, repeat: Infinity, times: [0, 0.1, 0.9, 1], delay: 0 }}
                        className="flex items-start gap-3"
                      >
                        <span className="text-[#FFFDF9]/50 shrink-0">01</span>
                        <span className="text-[#00E6C3] drop-shadow-[0_0_8px_rgba(0,230,195,0.5)] shrink-0">{">"}</span>
                        <span className="truncate">Analyzing workspace dependencies...</span>
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: [0, 1, 1, 0], y: [10, 0, 0, -10] }}
                        transition={{ duration: 5, repeat: Infinity, times: [0, 0.1, 0.9, 1], delay: 1.5 }}
                        className="flex items-start gap-3"
                      >
                        <span className="text-[#FFFDF9]/50 shrink-0">02</span>
                        <span className="text-[#00E6C3] drop-shadow-[0_0_8px_rgba(0,230,195,0.5)] shrink-0">{">"}</span>
                        <span className="truncate">Drafting migration for <span className="text-[#FFFDF9] font-medium">src/core/auth.ts</span></span>
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: [0, 1, 1, 0], y: [10, 0, 0, -10] }}
                        transition={{ duration: 5, repeat: Infinity, times: [0, 0.1, 0.9, 1], delay: 3 }}
                        className="flex items-start gap-3"
                      >
                        <span className="text-[#FFFDF9]/50 shrink-0">03</span>
                        <span className="text-[#00E6C3] drop-shadow-[0_0_8px_rgba(0,230,195,0.5)] shrink-0">{">"}</span>
                        <span className="truncate">Staging diff matrix. Awaiting validation.</span>
                      </motion.div>
                   </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Right Block Matrix: Features & Flat CLI Installer (Span 5) */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            
            {/* Top Cell: Architecture Card */}
            <ScrollReveal delay={0.2} className="flex-1 rounded-[32px] border border-[#FFFDF9]/10 bg-[#0A0A0A]/40 backdrop-blur-md p-8 sm:p-10 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-[0.02] transform translate-x-4 -translate-y-4 group-hover:opacity-[0.05] group-hover:scale-110 transition-all duration-1000 pointer-events-none">
                 <Terminal className="w-32 h-32 text-[#FFFDF9]" />
               </div>
               
               <h3 className="font-display text-3xl font-light text-[#FFFDF9] mb-4 tracking-tight">
                 Local execution. <br/><span className="text-[#FFFDF9]/50 font-normal">Zero telemetry.</span>
               </h3>
               <p className="font-body text-sm font-light leading-relaxed text-[#FFFDF9]/50">
                 The orchestrator runs entirely on your local machine. It maps dependencies, scans project structures, and interacts with LLMs seamlessly while respecting your `.gitignore`.
               </p>
               
               <div className="mt-10 flex items-center gap-4">
                 <div className="h-px flex-1 bg-gradient-to-r from-[#FFFDF9]/20 to-transparent" />
                 <span className="font-mono text-[9px] text-[#FFFDF9]/40 uppercase tracking-widest font-normal">v1.0.0 Stable</span>
               </div>
            </ScrollReveal>

            {/* Bottom Cell: Premium Flattened Installer Component */}
            <ScrollReveal delay={0.3} className="rounded-[32px] border border-[#FFFDF9]/10 bg-[#050505] overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.8)] relative">
              
              {/* Terminal Header Bar with Flattened Tabs */}
              <div className="flex flex-col border-b border-[#FFFDF9]/10 bg-[#0A0A0A]">
                
                {/* Mac Dots & Container Header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-[#FFFDF9]/5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]" />
                  </div>
                  <span className="font-mono text-[9px] font-normal uppercase tracking-widest text-[#FFFDF9]/30">Deployment Script</span>
                </div>

                {/* Highly Specific Scrollable Architecture Tabs */}
                <div className="flex items-center px-2 py-2 overflow-x-auto scrollbar-none">
                  {INSTALL_METHODS.map((method) => {
                    const isActive = activeMethod.id === method.id;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setActiveMethod(method)}
                        className={cn(
                          "relative px-3.5 py-1.5 text-[10px] font-mono uppercase tracking-wider transition-colors rounded-lg whitespace-nowrap outline-none",
                          isActive ? "text-[#000000] font-normal" : "text-[#FFFDF9]/40 hover:text-[#FFFDF9]"
                        )}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeInstallTab"
                            className="absolute inset-0 bg-[#FFFDF9] rounded-lg shadow-sm"
                            initial={false}
                            transition={{ type: "spring", stiffness: 500, damping: 35 }}
                          />
                        )}
                        <span className="relative z-10">{method.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Terminal Code Area */}
              <div className="relative group p-6 sm:p-8 min-h-[160px] flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeMethod.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="font-mono text-xs sm:text-sm"
                  >
                    <div className="text-[#FFFDF9]/30 italic mb-4 font-light">
                      {activeMethod.comment}
                    </div>
                    <div className="flex items-center gap-3 pr-10">
                      <span className="text-[#FFFDF9]/50 font-normal">$</span>
                      <span className="text-[#FFFDF9] font-normal break-all">
                        {activeMethod.command}
                      </span>
                    </div>
                  </motion.div>
                </AnimatePresence>
                
                {/* Premium Hover Copy Button */}
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleCopy(activeMethod.command)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-[#FFFDF9]/5 border border-[#FFFDF9]/10 text-[#FFFDF9]/40 opacity-0 group-hover:opacity-100 hover:text-[#FFFDF9] hover:bg-[#FFFDF9]/10 hover:border-[#FFFDF9]/20 transition-all duration-300 backdrop-blur-md outline-none"
                      aria-label="Copy to clipboard"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-[#FFFDF9]" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="left" sideOffset={8} className="max-w-xs rounded-xl border border-white/10 bg-[#07070C] px-4 py-2 text-sm text-white/60 leading-relaxed shadow-2xl backdrop-blur-xl">
                    {copied ? "Copied!" : "Copy to clipboard"}
                  </TooltipContent>
                </Tooltip>
              </div>
            </ScrollReveal>
          </div>

        </div>
      </div>
    </ScrollSection>
    </TooltipProvider>
  );
}