"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Terminal, Play, Settings2 } from "lucide-react";
import { ScrollReveal, ScrollSection } from "@/components/landing/scroll-reveal";
import { cn } from "@/lib/utils";

// Define the available installation architectures mimicking the image structure
const INSTALL_METHODS = [
  { id: "curl", label: "One-liner", command: "curl -fsSL https://swiftclaw.dev/install.sh | bash", comment: "# Works everywhere. Installs everything. You're welcome. 🦞" },
  { id: "npm", label: "npm", command: "npm install -g swiftclaw", comment: "# Standard Node.js ecosystem installation." },
  { id: "bun", label: "bun", command: "bun add -g swiftclaw", comment: "# Blazing fast edge-optimized runtime." },
];

const OS_OPTIONS = [
  { id: "unix", label: "macOS & Linux" },
  { id: "win", label: "Windows" },
];

export function WhatIsSection() {
  const [activeMethod, setActiveMethod] = useState(INSTALL_METHODS[0]);
  const [activeOS, setActiveOS] = useState(OS_OPTIONS[0]);
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleCopy = (text: string) => {
    // If Windows is selected, maybe alter the curl command conceptually, 
    // but for demo we just copy the displayed text.
    const finalCommand = activeOS.id === 'win' && activeMethod.id === 'curl' 
      ? "iwr -useb https://swiftclaw.dev/install.ps1 | iex" 
      : activeMethod.command;

    navigator.clipboard.writeText(finalCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ScrollSection id="what-is" className="relative px-4 py-24 sm:px-6 bg-background overflow-hidden isolate">
      {/* Absolute Ambient Background Elements */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(248,247,251,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(248,247,251,0.08)_1px,transparent_1px)] bg-size-[24px_24px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(5,4,13,0.7),transparent_100%)]" />
      <div className="absolute top-0 right-0 -mr-64 -mt-32 h-125 w-125 rounded-full bg-sc-text opacity-3 blur-30" />

      <div className="mx-auto max-w-7xl relative z-10">
        <div className="pointer-events-none hidden md:flex justify-between mb-8 text-[9px] uppercase tracking-[0.25em] text-[#FFFDF9]/30 font-mono select-none">
          <span>SYS.VER // 1.0.0-STABLE</span>
          <span>MODE // ZERO-TRUST_STAGING</span>
        </div>
        
        {/* Core Headline Matrix */}
        <ScrollReveal className="max-w-3xl mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
            <Settings2 className="w-4 h-4 text-white" />
            <span className="font-mono text-xs font-medium tracking-widest text-white/70 uppercase">Execution Model</span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-6">
            Autonomous execution. <br />
            <span className="text-transparent bg-linear-to-r from-zinc-500 to-zinc-200 bg-clip-text">Human-in-the-loop control.</span>
          </h2>
          <p className="font-body text-lg font-light leading-relaxed text-zinc-400 max-w-2xl">
            swiftClaw operates as a sandboxed terminal intelligence. It explores your architecture, drafts multi-file patches, and stages them in memory. Nothing hits your disk until you approve the diff.
          </p>
        </ScrollReveal>

        {/* Asymmetric Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Block: Premium Video/Visual Interface (Span 7) */}
          <ScrollReveal 
            variant="slideRight" 
            className="lg:col-span-7 group relative overflow-hidden rounded-3xl border border-white/10 bg-[#16161F]/70 backdrop-blur-sm min-h-100 flex items-center justify-center p-1"
          >
            <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative w-full h-full rounded-[20px] bg-black/60 overflow-hidden border border-white/5 flex flex-col">
              <div className="pointer-events-none hidden md:block absolute left-4 bottom-4 text-[9px] uppercase tracking-[0.25em] text-[#FFFDF9]/30 font-mono select-none">
                MEM_BUFFER // SECURE
              </div>
              {/* Fake IDE/Video Header */}
              <div className="h-12 w-full border-b border-white/10 flex items-center px-4 gap-2 bg-zinc-950/80 backdrop-blur-md z-10">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                  <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                </div>
                <div className="flex-1 text-center font-mono text-[10px] text-zinc-500">swiftClaw Engine Demo</div>
              </div>
              
              {/* Video Play Area Mock */}
              <div className="flex-1 relative flex items-center justify-center bg-zinc-950">
                 {!isPlaying ? (
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsPlaying(true)}
                      className="w-16 h-16 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-white/10 transition-colors duration-500 z-20"
                    >
                      <Play className="w-6 h-6 text-white ml-1 fill-white" />
                    </motion.button>
                 ) : (
                    <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-zinc-600">
                      [Video Stream Active]
                    </div>
                 )}
                 <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0,transparent_1px)] bg-size-[4px_4px]" />
              </div>
            </div>
          </ScrollReveal>

          {/* Right Block Matrix: Features & CLI Installer (Span 5) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Top Cell: Architecture Card */}
            <ScrollReveal variant="slideLeft" delay={0.1} className="flex-1 rounded-3xl border border-white/10 bg-[#0D1117] p-8 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-5 transform translate-x-4 -translate-y-4 group-hover:opacity-10 group-hover:scale-110 transition-all duration-700">
                 <Terminal className="w-24 h-24 text-white" />
               </div>
               
               <h3 className="font-display text-xl font-bold text-white mb-3 tracking-wide uppercase">
                 Local execution. <br/>Zero telemetry.
               </h3>
               <p className="font-body text-sm font-light leading-relaxed text-zinc-400">
                 The orchestrator runs entirely on your local machine. It maps dependencies, scans project structures, and interacts with LLMs seamlessly while respecting your `.gitignore`.
               </p>
               
               <div className="mt-8 flex items-center gap-3">
                 <div className="h-px flex-1 bg-linear-to-r from-zinc-800 to-transparent" />
                 <span className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">v1.0.0 Stable</span>
               </div>
            </ScrollReveal>

            {/* Bottom Cell: The Screenshot-Inspired Installer Component */}
            <ScrollReveal variant="slideUp" delay={0.2} className="rounded-3xl border border-white/10 bg-[#16161F] overflow-hidden shadow-2xl relative">
              
              {/* Terminal Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 bg-[#161B22] border-b border-white/5">
                
                {/* Left Side: Window Controls & Package Manager Tabs */}
                <div className="flex items-center gap-4">
                  {/* MacOS Window Controls */}
                  <div className="flex items-center gap-1.5 pl-1 shrink-0">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                    <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                  </div>

                  {/* Installation Method Tabs */}
                  <div className="flex items-center p-1 rounded-md bg-[#010409]">
                    {INSTALL_METHODS.map((method) => {
                      const isActive = activeMethod.id === method.id;
                      return (
                        <button
                          key={method.id}
                          onClick={() => setActiveMethod(method)}
                          className={cn(
                            "relative px-3 py-1 text-[11px] font-mono transition-colors rounded-sm",
                            isActive ? "text-[#0D1117] font-semibold" : "text-zinc-400 hover:text-zinc-200"
                          )}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="activeMethodBg"
                              className="absolute inset-0 bg-[#00E6C3] rounded-sm"
                              initial={false}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                          )}
                          <span className="relative z-10">{method.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right Side: OS Selection Tabs */}
                <div className="flex items-center p-1 rounded-md bg-[#010409]">
                  {OS_OPTIONS.map((os) => {
                    const isActive = activeOS.id === os.id;
                    return (
                      <button
                        key={os.id}
                        onClick={() => setActiveOS(os)}
                        className={cn(
                          "relative px-3 py-1 text-[11px] font-mono transition-colors rounded-sm",
                          isActive ? "text-[#0D1117] font-semibold" : "text-zinc-400 hover:text-zinc-200"
                        )}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeOSBg"
                            className="absolute inset-0 bg-[#FF5757] rounded-sm"
                            initial={false}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10">{os.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Terminal Code Area */}
              <div className="relative group p-6 bg-[#0D1117] min-h-35 flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${activeMethod.id}-${activeOS.id}`}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="font-mono text-sm"
                  >
                    <div className="text-zinc-500 italic mb-4">
                      {activeMethod.comment}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[#FF5757] font-bold">$</span>
                      <span className="text-zinc-200 tracking-tight">
                        {activeOS.id === 'win' && activeMethod.id === 'curl' 
                          ? "iwr -useb https://swiftclaw.dev/install.ps1 | iex" 
                          : activeMethod.command}
                      </span>
                    </div>
                  </motion.div>
                </AnimatePresence>
                
                {/* Hover Copy Button */}
                <button
                  onClick={() => handleCopy(activeMethod.command)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400 opacity-0 group-hover:opacity-100 hover:text-white hover:bg-white/10 transition-all backdrop-blur-md"
                  aria-label="Copy code"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-[#00E6C3]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </ScrollReveal>
          </div>

        </div>
      </div>
    </ScrollSection>
  );
}