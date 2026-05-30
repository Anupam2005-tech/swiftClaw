"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Copy, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollReveal, ScrollSection } from "@/components/landing/scroll-reveal";

const INSTALL_METHODS = [
  { id: "curl", label: "cURL", command: "curl -fsSL https://swiftclaw.dev/install.sh | bash" },
  { id: "npm", label: "npm", command: "npm install -g swiftclaw" },
  { id: "pnpm", label: "pnpm", command: "pnpm add -g swiftclaw" },
  { id: "bun", label: "bun", command: "bun add -g swiftclaw" },
] as const;

export function InstallSection() {
  const [activeMethod, setActiveMethod] = useState<(typeof INSTALL_METHODS)[number]["id"]>("curl");
  const [copied, setCopied] = useState(false);

  const current = INSTALL_METHODS.find((m) => m.id === activeMethod) ?? INSTALL_METHODS[0];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(current.command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ScrollSection id="install" className="relative px-4 py-32 sm:px-6 bg-background selection:bg-accent selection:text-background isolate">
      
      {/* Absolute Ambient Background */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(248,247,251,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(248,247,251,0.05)_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_50%_50%_at_50%_50%,rgba(5,4,13,0.6),transparent_100%)] pointer-events-none" />

      <div className="mx-auto max-w-3xl relative z-10 text-center">
        
        {/* Typographic Header Matrix */}
        <ScrollReveal className="mb-16">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3.5 py-1.5 backdrop-blur-xl">
            <Terminal className="h-3.5 w-3.5 text-accent" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
              Deployment Phase
            </span>
          </div>
          <h2 className="font-display text-4xl sm:text-6xl font-black tracking-tight text-[#FFFDF9] mb-4">
            Initialize the Agent.
          </h2>
          <p className="font-body text-sm font-light text-[#FFFDF9]/50">
            Universal binary distribution. Pick your runtime environment.
          </p>
          <div className="pointer-events-none hidden md:flex justify-between mt-4 text-[9px] uppercase tracking-[0.25em] text-[#FFFDF9]/30 font-mono select-none">
            <span>MEM_BUFFER // SECURE</span>
            <span>UID // ROOT_ACCESS_GRANTED</span>
          </div>
        </ScrollReveal>

        {/* The Premium Installer Terminal */}
        <ScrollReveal delay={0.15} className="mx-auto max-w-2xl">
          <div className="relative overflow-hidden rounded-[24px] border border-[#FFFDF9]/15 bg-[#15151C] shadow-[0_20px_60px_rgba(0,0,0,0.75)]">
            
            {/* Terminal Header & Segmented Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#FFFDF9]/10 bg-[#16161F]/50 px-4 py-3">
              
              {/* Window Controls (macOS style in monochrome) */}
              <div className="flex items-center gap-2 pl-2">
                <div className="h-2.5 w-2.5 rounded-full bg-[#FFFDF9]/20" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#FFFDF9]/20" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#FFFDF9]/20" />
              </div>

              {/* Dynamic Package Manager Tabs */}
              <div className="flex items-center gap-1 rounded-lg bg-background p-1 border border-sc-text/5">
                {INSTALL_METHODS.map((method) => {
                  const isActive = activeMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setActiveMethod(method.id)}
                      className={cn(
                        "relative px-4 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors rounded-md",
                        isActive ? "text-accent-foreground" : "text-sc-text/50 hover:text-accent"
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeInstallTab"
                          className="absolute inset-0 bg-accent rounded-md"
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

            {/* Terminal Code Area */}
            <div className="group relative flex items-center justify-between bg-linear-to-br from-[#0A0A0A] to-[#000000] p-6 sm:p-8 min-h-30">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-x-auto whitespace-nowrap scrollbar-none pr-16"
                >
                  <span className="font-mono text-sm sm:text-base font-bold text-[#FFFDF9]">
                    <span className="text-[#FFFDF9]/30 mr-4 select-none">$</span>
                    {current.command}
                  </span>
                </motion.div>
              </AnimatePresence>

              {/* Hover Copy Button */}
              <button
                onClick={handleCopy}
                className="absolute right-6 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent/90 backdrop-blur-md transition-all duration-300 hover:border-accent/50 hover:bg-accent/15 hover:text-accent"
                aria-label="Copy to clipboard"
              >
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.div
                      key="check"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Check className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="copy"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Copy className="h-4 w-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
            
          </div>
        </ScrollReveal>
      </div>
    </ScrollSection>
  );
}