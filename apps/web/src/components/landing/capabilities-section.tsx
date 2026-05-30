"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, MessageCircle, Map, Shield, ArrowUpRight, Sparkles, Check, Orbit, Activity, TerminalSquare, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { ScrollReveal, ScrollSection } from "@/components/landing/scroll-reveal";

// --- KINETIC SIMULATIONS (ULTRA SASSY & BOUNDED) ---

function AgentTerminalVisual() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false, margin: "-100px" }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="absolute bottom-0 right-0 w-[92%] sm:w-[88%] rounded-tl-[32px] border-t border-l border-accent/20 bg-linear-to-br from-[#08080E]/98 to-[#020205]/98 backdrop-blur-2xl p-5 sm:p-6 shadow-[-20px_-20px_50px_rgba(0,0,0,0.9)] pointer-events-none group-hover:border-accent/40 transition-colors duration-700"
    >
       <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-size-[1rem_1rem] pointer-events-none" />
      
      <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-3 relative z-10">
        <div className="flex gap-2">
          <div className="h-2 w-2 rounded-full bg-[#FF5F56]/60 shadow-[0_0_8px_rgba(255,95,86,0.2)] animate-pulse" />
          <div className="h-2 w-2 rounded-full bg-[#FFBD2E]/40" />
          <div className="h-2 w-2 rounded-full bg-[#27C93F]/40" />
        </div>
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-accent/60 animate-spin-slow" />
          <span className="font-mono text-[9px] font-normal uppercase tracking-[0.2em] text-accent/70">Engine Core v1.0</span>
        </div>
      </div>
      
      <div className="font-mono text-[10px] sm:text-[11px] leading-relaxed text-white/50 flex flex-col justify-end space-y-1 relative z-10 h-[90px]">
        <motion.div 
          animate={{ opacity: [0, 1, 1, 0, 0] }} 
          transition={{ duration: 10, repeat: Infinity, times: [0, 0.05, 0.3, 0.35, 1] }}
          className="absolute text-white/80 w-full"
        >
          <span className="text-accent/60 mr-2">✦</span> <span className="text-white/40">swiftClaw:</span> Analyzing spaghetti architecture...
        </motion.div>
        
        <motion.div 
          animate={{ opacity: [0, 0, 1, 1, 0] }} 
          transition={{ duration: 10, repeat: Infinity, times: [0, 0.35, 0.4, 0.65, 1] }}
          className="absolute text-white/80 w-full"
        >
          <span className="text-white/30 mr-2">❯</span> <span className="text-white/40">swiftClaw:</span> Ugh, fine. Drafting migration for auth.ts
        </motion.div>

        <motion.div 
          animate={{ opacity: [0, 0, 0, 1, 1] }} 
          transition={{ duration: 10, repeat: Infinity, times: [0, 0.65, 0.7, 0.95, 1] }}
          className="absolute text-[#FFFDF9] w-full"
        >
          <span className="text-accent mr-2">●</span> <span className="text-accent/60">swiftClaw:</span> Staged diff matrix. Awaiting your slow human clearance.
          <motion.span 
            animate={{ opacity: [0, 1, 0] }} 
            transition={{ duration: 0.8, repeat: Infinity }}
            className="ml-2 inline-block h-3.5 w-1.5 bg-accent/80 align-middle"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

function TelegramMobileVisual() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false, margin: "-100px" }}
      transition={{ type: "spring", stiffness: 100, damping: 22 }}
      className="absolute bottom-0 left-1/2 w-[85%] sm:w-[75%] -translate-x-1/2 rounded-t-[32px] border-t border-l border-r border-white/10 bg-linear-to-b from-[#0D0D14] to-[#020204] p-5 shadow-[0_-20px_50px_rgba(0,0,0,0.9)] pointer-events-none group-hover:border-accent/30 transition-colors duration-700"
    >
      <div className="mb-4 flex justify-center pt-1">
        <div className="h-1.5 w-12 rounded-full bg-white/5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]" />
      </div>
      
      <div className="space-y-3 relative h-[110px]">
        {/* Agent Message */}
        <motion.div 
          animate={{ opacity: [0, 1, 1, 1, 0], y: [10, 0, 0, 0, -10] }}
          transition={{ duration: 12, repeat: Infinity, times: [0, 0.05, 0.95, 0.98, 1] }}
          className="relative max-w-[90%] rounded-2xl rounded-tl-sm bg-white/4 p-3 text-[10px] sm:text-[11px] text-white/70 border border-white/5 shadow-2xl backdrop-blur-md"
        >
          <div className="absolute -top-1 -left-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent shadow-[0_0_10px_rgba(255,92,77,0.8)] text-black">
            <Bot className="h-2.5 w-2.5" />
          </div>
          <span className="block font-display font-light text-white mb-1 tracking-wider opacity-60">swiftClaw</span>
          Found 14 vulnerabilities. Want me to fix your mess?
        </motion.div>

        {/* User Approval Action */}
        <motion.div 
          animate={{ opacity: [0, 0, 1, 1, 0], scale: [0.95, 0.95, 1, 1, 0.95] }}
          transition={{ duration: 12, repeat: Infinity, times: [0, 0.25, 0.3, 0.95, 1] }}
          className="flex justify-end w-full"
        >
          <motion.div 
            animate={{ 
              backgroundColor: ["rgba(255,253,249,0.04)", "rgba(255,253,249,0.04)", "#FFFDF9", "rgba(255,253,249,0.04)"],
              color: ["rgba(255,253,249,0.4)", "rgba(255,253,249,0.4)", "#000000", "rgba(255,253,249,0.4)"]
            }}
            transition={{ duration: 12, repeat: Infinity, times: [0, 0.45, 0.5, 1] }}
            className="rounded-xl border border-white/10 px-4 py-2 flex items-center justify-center font-normal text-[10px] sm:text-[11px]"
          >
            <Check className="h-3 w-3 mr-1.5 shrink-0" /> Approve
          </motion.div>
        </motion.div>

        {/* Agent Reply */}
        <motion.div 
          animate={{ opacity: [0, 0, 0, 1, 0], y: [10, 10, 10, 0, -10] }}
          transition={{ duration: 12, repeat: Infinity, times: [0, 0.6, 0.65, 0.95, 1] }}
          className="relative max-w-[90%] rounded-2xl rounded-tl-sm bg-linear-to-br from-accent/10 to-transparent p-3 text-[10px] sm:text-[11px] text-accent/90 border border-accent/20 shadow-2xl backdrop-blur-md"
        >
          Deploying to staging. Try not to break it again.
        </motion.div>
      </div>
    </motion.div>
  );
}

function PlanAskVisual() {
  const [mode, setMode] = useState<"plan" | "ask">("plan");

  useEffect(() => {
    const interval = setInterval(() => {
      setMode(prev => prev === "plan" ? "ask" : "plan");
    }, 6000); // Switch every 6 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: false }}
      className="absolute inset-0 p-8 flex flex-col justify-end pointer-events-none"
    >
      <div className="absolute top-6 right-6 flex gap-1 p-1 rounded-full bg-black/40 border border-white/5 backdrop-blur-xl">
        <div className={cn("px-2.5 py-1 rounded-full font-mono text-[8px] transition-colors duration-500", mode === "plan" ? "bg-white/10 text-white" : "text-white/30")}>PLAN</div>
        <div className={cn("px-2.5 py-1 rounded-full font-mono text-[8px] transition-colors duration-500", mode === "ask" ? "bg-accent/20 text-accent" : "text-white/30")}>ASK</div>
      </div>

      <AnimatePresence mode="wait">
        {mode === "plan" ? (
          <motion.div 
            key="plan"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="w-[85%] rounded-2xl border border-white/10 bg-[#050505]/90 p-4 shadow-2xl backdrop-blur-xl"
          >
             <div className="flex items-center gap-2 mb-3 text-white/50 text-[10px] font-mono">
               <Map className="h-3 w-3" /> Mapping architecture...
             </div>
             <div className="relative h-20 w-full">
               {/* Sassy Node Graph Animation */}
               <motion.div animate={{ scale: [0.9, 1, 0.9] }} transition={{ duration: 2, repeat: Infinity }} className="absolute top-2 left-2 w-4 h-4 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-[6px] font-mono">DB</motion.div>
               <motion.div animate={{ scale: [0.9, 1, 0.9] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-accent/40 border border-accent flex items-center justify-center text-[6px] font-mono">API</motion.div>
               <motion.div animate={{ scale: [0.9, 1, 0.9] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }} className="absolute top-4 right-4 w-4 h-4 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-[6px] font-mono">UI</motion.div>
               
               <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
                 <motion.path d="M 24 16 L 120 60" stroke="white" strokeWidth="1" strokeDasharray="2 2" animate={{ strokeDashoffset: [0, -10] }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                 <motion.path d="M 120 60 L 220 24" stroke="#FFFDF9" strokeWidth="1" strokeDasharray="2 2" animate={{ strokeDashoffset: [0, 10] }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
               </svg>
             </div>
          </motion.div>
        ) : (
          <motion.div 
            key="ask"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="w-[85%] rounded-2xl border border-accent/20 bg-[#0A0A0A]/95 p-4 shadow-2xl backdrop-blur-xl"
          >
             <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/5 text-white/50 text-[10px] font-mono">
               <Eye className="h-3 w-3 text-accent" /> Read-Only Query
             </div>
             <div className="font-mono text-[10px] space-y-2">
               <div className="text-white/60">
                 <span className="text-white/30">User❯</span> Where is the auth logic?
               </div>
               <motion.div 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                 className="text-accent/80"
               >
                 <span className="text-accent/40">Agent●</span> Hidden in 4 different microservices. Honestly, who wrote this? I mapped it for you anyway.
               </motion.div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const CAPABILITIES = [
  {
    title: "Agent Mode",
    meta: "AUTONOMOUS SYSTEM",
    description: "Assign complex objectives, step back, and watch staged atomic patches pile up securely in memory. Zero automated storage writes.",
    icon: <Bot className="h-4 w-4 text-white" strokeWidth={1.5} />,
    colSpan: "md:col-span-2",
    visual: <AgentTerminalVisual />,
  },
  {
    title: "Telegram Gateway",
    meta: "REMOTE TELEMETRY",
    description: "Real-time verification structures and prompt stream pipelines pushed directly to your personal authenticated hardware.",
    icon: <MessageCircle className="h-4 w-4 text-white" strokeWidth={1.5} />,
    colSpan: "md:col-span-1",
    visual: <TelegramMobileVisual />,
  },
  {
    title: "Plan & Ask Operations",
    meta: "COGNITIVE LAYERS",
    description: "Deconstruct system architectures into isolated topological milestone pathways. Query messy multi-file infrastructures in an immutable, entirely read-only sandbox.",
    icon: <Map className="h-4 w-4 text-white" strokeWidth={1.5} />,
    colSpan: "md:col-span-3",
    visual: <PlanAskVisual />,
  },
];

export function CapabilitiesSection() {
  return (
    <ScrollSection id="capabilities" className="relative px-4 py-36 sm:px-6 bg-[#030303] overflow-hidden isolate selection:bg-accent selection:text-background smooth-scroll">
      
      {/* --- CRAZY AWARD-WINNING STRUCTURAL GRIDWORK --- */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(255,92,77,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,92,77,0.03)_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_70%_60%_at_50%_20%,#000_70%,transparent_100%)] pointer-events-none" />
      
      {/* Laser-cut alignment borders */}
      <div className="absolute top-0 bottom-0 left-12 w-px bg-linear-to-b from-white/0 via-white/3 to-white/0 hidden xl:block pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-12 w-px bg-linear-to-b from-white/0 via-white/3 to-white/0 hidden xl:block pointer-events-none" />

      {/* Extreme ambient node spots */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-linear-to-b from-accent/5 to-transparent blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-12 right-12 w-96 h-96 bg-accent/1 blur-[150px] rounded-full pointer-events-none" />

      {/* Geometric Layout Markers */}
      <div className="absolute top-12 left-16 hidden xl:flex items-center gap-2 pointer-events-none font-mono text-[8px] uppercase tracking-[0.3em] text-white/10">
        <Orbit className="h-3 w-3 animate-spin-slow" /> [ CAP_INDEX_A ]
      </div>
      <div className="absolute top-12 right-16 hidden xl:flex items-center gap-2 pointer-events-none font-mono text-[8px] uppercase tracking-[0.3em] text-white/10">
        [ NODE_SYS_ACCESS ] <Activity className="h-3 w-3 text-accent/30" />
      </div>

      <div className="mx-auto max-w-6xl relative z-10">
        
        {/* --- SECTION HEADER (STRICTLY NO BOLD) --- */}
        <ScrollReveal className="mb-28 flex flex-col md:flex-row md:items-end justify-between gap-12">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-accent/20 bg-accent/3 px-4 py-1.5 backdrop-blur-xl">
              <Shield className="h-3.5 w-3.5 text-accent animate-pulse" strokeWidth={1.5} />
              <span className="font-mono text-[9px] font-normal uppercase tracking-[0.25em] text-accent">Zero-Trust Environment</span>
            </div>
            <h2 className="font-display text-5xl font-light tracking-tight text-white sm:text-6xl lg:text-7xl leading-[1.05]">
              The Arsenal.
            </h2>
          </div>
          
          <p className="max-w-sm font-body text-base font-light leading-relaxed text-white/40 pb-2 md:text-right">
            Three core architecture domains. Wrapped completely inside an immutable{" "}
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger className="cursor-help text-white/70 font-normal underline decoration-accent/30 underline-offset-4 hover:decoration-accent hover:text-white transition-colors">
                  staging engine
                </TooltipTrigger>
                <TooltipContent sideOffset={12} className="max-w-xs rounded-xl border border-white/10 bg-[#07070C] p-4 font-body text-xs text-white/60 leading-relaxed shadow-2xl backdrop-blur-xl">
                  <span className="block font-mono text-[9px] tracking-widest text-accent uppercase mb-1.5">BUFFER LAYER SECURE</span>
                  All code generations stack cleanly inside ephemeral virtual memory channels. Core files are protected dynamically until human signature confirmation.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>.
          </p>
        </ScrollReveal>

        {/* --- DYNAMIC ASYMMETRIC MATRIX GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[400px]">
          {CAPABILITIES.map((item, index) => (
            <ScrollReveal 
              key={item.title} 
              delay={index * 0.12}
              className={cn(
                "group relative overflow-hidden rounded-[32px] bg-linear-to-b from-[#0A0A10]/60 to-[#040407]/90 border border-white/4 transition-all duration-1000 flex flex-col justify-between shadow-2xl",
                "hover:border-accent/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,92,77,0.05)]",
                item.colSpan
              )}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,92,77,0.03),transparent_50%)] opacity-0 transition-opacity duration-1000 group-hover:opacity-100 pointer-events-none" />
              
              <div className="relative z-10 flex flex-col p-8 sm:p-10 w-full pointer-events-none">
                <div className="flex items-center justify-between mb-8 w-full">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/5 bg-white/2 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] group-hover:border-accent/20 group-hover:bg-accent/2 transition-colors duration-700">
                    <div className="text-white/40 group-hover:text-accent transition-colors duration-700">
                      {item.icon}
                    </div>
                  </div>
                  <span className="font-mono text-[8px] font-normal uppercase tracking-[0.25em] text-white/30 border border-white/5 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md whitespace-nowrap ml-4 group-hover:text-accent/60 group-hover:border-accent/10 transition-colors duration-700">
                    {item.meta}
                  </span>
                </div>
                
                <div className="max-w-md relative z-20 transition-transform duration-700 group-hover:translate-y-[-2px]">
                  <h3 className="mb-3 font-display text-2xl font-light tracking-tight text-white group-hover:text-white/90 transition-colors">
                    {item.title}
                  </h3>
                  <p className="font-body text-sm font-light leading-relaxed text-white/40 group-hover:text-white/50 transition-colors duration-700">
                    {item.description}
                  </p>
                </div>
              </div>

              {item.visual && (
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-[32px]">
                  {item.visual}
                </div>
              )}
              
               <div className="absolute bottom-3 left-8 font-mono text-[8px] text-white/5 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none">
                 {"// sys_pipeline_active"}
               </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </ScrollSection>
  );
}