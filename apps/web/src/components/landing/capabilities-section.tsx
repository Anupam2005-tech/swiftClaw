"use client";

import { motion } from "framer-motion";
import { Bot, MessageCircle, Map, Shield, ArrowRight, Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollReveal, ScrollSection } from "@/components/landing/scroll-reveal";

// --- KINETIC SIMULATIONS (STRICTLY BOUNDED) ---

function AgentTerminalVisual() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-50px" }}
      className="absolute bottom-0 right-0 w-[90%] sm:w-[85%] rounded-tl-[24px] border-t border-l border-[#FFFDF9]/15 bg-[#050505]/95 backdrop-blur-2xl p-4 sm:p-5 shadow-[-10px_-10px_40px_rgba(0,0,0,0.8)] pointer-events-none"
    >
      <div className="mb-3 flex items-center justify-between border-b border-[#FFFDF9]/10 pb-2.5">
        <div className="flex gap-1.5">
          <div className="h-2 w-2 rounded-full bg-[#FFFDF9]/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]" />
          <div className="h-2 w-2 rounded-full bg-[#FFFDF9]/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]" />
        </div>
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-accent/60" />
          <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-accent/70">Engine Active</span>
        </div>
      </div>
      
      <div className="font-mono text-[9px] sm:text-[10px] leading-relaxed text-[#FFFDF9]/60 flex flex-col justify-end">
        <motion.div 
          whileInView={{ opacity: [0, 1, 1, 1, 0] }} 
          transition={{ duration: 6, repeat: Infinity, times: [0, 0.1, 0.85, 0.95, 1] }}
          className="text-[#FFFDF9] truncate"
        >
          <span className="text-[#FFFDF9]/30 mr-2">01</span>
          <span className="text-[#FFFDF9]/50 mr-1.5">{">"}</span> staging modify_file src/auth.ts
        </motion.div>
        
        <motion.div 
          whileInView={{ opacity: [0, 0, 1, 1, 0] }} 
          transition={{ duration: 6, repeat: Infinity, times: [0, 0.25, 0.35, 0.95, 1] }}
          className="truncate"
        >
          <span className="text-[#FFFDF9]/30 mr-2">02</span>
          <span className="text-[#FFFDF9]/50 mr-1.5">{">"}</span> compiling diff matrix...
        </motion.div>

        <motion.div 
          whileInView={{ opacity: [0, 0, 0, 1, 0] }} 
          transition={{ duration: 6, repeat: Infinity, times: [0, 0.5, 0.6, 0.95, 1] }}
          className="flex items-center text-[#FFFDF9] truncate"
        >
          <span className="text-[#FFFDF9]/30 mr-2">03</span>
          <span className="text-[#FFFDF9]/50 mr-1.5">{">"}</span> awaiting human clearance
          <motion.span 
            animate={{ opacity: [0, 1, 0] }} 
            transition={{ duration: 0.8, repeat: Infinity }}
            className="ml-1.5 inline-block h-3 w-1.5 bg-[#FFFDF9]/80 shrink-0"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

function TelegramMobileVisual() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-50px" }}
      className="absolute bottom-0 left-1/2 w-[75%] sm:w-[65%] -translate-x-1/2 rounded-t-[24px] border-t border-l border-r border-[#FFFDF9]/15 bg-linear-to-b from-[#0A0A0A] to-[#000000] p-4 shadow-[0_-15px_40px_rgba(0,0,0,0.8)] pointer-events-none"
    >
      <div className="mb-3 flex justify-center pt-0.5">
        <div className="h-1 w-8 rounded-full bg-[#FFFDF9]/15 shadow-[inset_0_1px_1px_rgba(0,0,0,0.5)]" />
      </div>
      
      <div className="space-y-2.5">
        <motion.div 
          whileInView={{ opacity: [0, 1, 1, 1, 0], scale: [0.9, 1, 1, 1, 0.9], originY: 1 }}
          transition={{ duration: 5, repeat: Infinity, times: [0, 0.15, 0.85, 0.95, 1] }}
          className="relative rounded-2xl rounded-bl-sm bg-linear-to-br from-[#FFFDF9]/10 to-[#FFFDF9]/5 p-3 text-[9px] sm:text-[10px] text-[#FFFDF9]/80 border border-[#FFFDF9]/10 shadow-lg backdrop-blur-sm"
        >
          <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[#FFFDF9] shadow-[0_0_8px_rgba(255,253,249,0.6)] animate-pulse" />
          <span className="block font-display font-bold text-[#FFFDF9] mb-1 tracking-wide">⚠️ Staged Mutation</span>
          Refactor auth middleware. Proceed?
        </motion.div>

        <motion.div 
          whileInView={{ opacity: [0, 0, 1, 1, 0] }}
          transition={{ duration: 5, repeat: Infinity, times: [0, 0.25, 0.35, 0.95, 1] }}
          className="flex gap-2"
        >
          <motion.div 
            whileInView={{ 
              scale: [1, 1, 0.95, 1, 1], 
              backgroundColor: ["#FFFDF9", "#FFFDF9", "#000000", "#FFFDF9", "#FFFDF9"],
              color: ["#000000", "#000000", "#FFFDF9", "#000000", "#000000"]
            }}
            transition={{ duration: 5, repeat: Infinity, times: [0, 0.6, 0.65, 0.7, 1] }}
            className="flex-1 rounded-md py-1.5 flex items-center justify-center font-bold text-[9px] sm:text-[10px] shadow-[0_2px_10px_rgba(255,253,249,0.2)]"
          >
            <Check className="h-2.5 w-2.5 mr-1" /> Approve
          </motion.div>
          <div className="flex-1 rounded-md border border-[#FFFDF9]/15 bg-[#FFFDF9]/5 py-1.5 text-center text-[9px] sm:text-[10px] font-medium text-[#FFFDF9]/50">
            Reject
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

const CAPABILITIES = [
  {
    title: "Agent Mode",
    meta: "The Workhorse",
    description: "Assign a task, step back, and watch staged files stack up in memory. Nothing writes to disk until you approve.",
    icon: <Bot className="h-5 w-5 text-[#FFFDF9]" />,
    tags: ["Autonomous", "Staging"],
    colSpan: "md:col-span-2",
    visual: <AgentTerminalVisual />,
  },
  {
    title: "Telegram Gateway",
    meta: "Remote Command",
    description: "Diff previews and one-tap approvals delivered straight to your phone. Authenticated via TELEGRAM_OWNER_ID.",
    icon: <MessageCircle className="h-5 w-5 text-[#FFFDF9]" />,
    tags: ["Mobile", "HITL"],
    colSpan: "md:col-span-1",
    visual: <TelegramMobileVisual />,
  },
  {
    title: "Plan & Ask Operations",
    meta: "Architect + Reader",
    description: "Plan mode decomposes sweeping migrations into interactive milestones. Ask mode maps undocumented codebases in a strictly read-only sandbox.",
    icon: <Map className="h-5 w-5 text-[#FFFDF9]" />,
    tags: ["Architecture", "Read-Only"],
    colSpan: "md:col-span-3",
    visual: (
      <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-0 transition-all duration-700 group-hover:opacity-100 group-hover:translate-x-6 hidden md:flex items-center justify-center">
        <ArrowRight className="h-12 w-12 text-[#FFFDF9]/20" />
      </div>
    ),
  },
];

export function CapabilitiesSection() {
  return (
    <ScrollSection id="capabilities" className="relative px-4 py-32 sm:px-6 bg-background selection:bg-accent selection:text-background overflow-hidden isolate">
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(255,92,77,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,92,77,0.06)_1px,transparent_1px)] bg-size-[3rem_3rem] mask-[radial-gradient(ellipse_80%_60%_at_50%_10%,rgba(5,4,13,0.7),transparent_100%)] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-100 bg-sc-text opacity-2 blur-30 rounded-full pointer-events-none" />

      <div className="mx-auto max-w-6xl relative z-10">
        <ScrollReveal className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3.5 py-1.5 backdrop-blur-xl">
              <Shield className="h-3.5 w-3.5 text-accent" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-accent">Zero-Trust Architecture</span>
            </div>
            <h2 className="font-display text-5xl font-black tracking-tight text-[#FFFDF9] sm:text-6xl">
              The Arsenal.
            </h2>
          </div>
          <p className="max-w-sm font-body text-sm font-light leading-relaxed text-[#FFFDF9]/60 pb-2 md:text-right">
            Three operational modes. One impenetrable{" "}
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger className="cursor-help text-[#FFFDF9] underline decoration-[#FFFDF9]/30 underline-offset-4 hover:decoration-[#FFFDF9]">
                  staging engine
                </TooltipTrigger>
                <TooltipContent sideOffset={8} className="rounded-xl border border-[#FFFDF9]/15 bg-[#0A0A0A]/95 backdrop-blur-xl px-5 py-4 font-body text-xs text-[#FFFDF9]">
                  <span className="font-bold text-[#FFFDF9]">Buffer Active:</span> Every mutation is held in memory. Live files are never touched without approval.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[380px]">
          {CAPABILITIES.map((item, index) => (
            <ScrollReveal 
              key={item.title} 
              delay={index * 0.15}
              className={cn(
                "group relative overflow-hidden rounded-[32px] bg-linear-to-b from-[#13131A] to-[#18181F] shadow-[inset_0_0_0_1px_rgba(255,253,249,0.07)] transition-all duration-700 hover:shadow-[inset_0_0_0_1px_rgba(255,92,77,0.15),0_10px_40px_rgba(255,92,77,0.12)] flex flex-col",
                item.colSpan
              )}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,253,249,0.06),transparent_60%)] opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
              
              <div className="relative z-10 flex flex-col p-8 w-full">
                <div className="flex items-start justify-between mb-8 w-full">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-accent/20 bg-accent/5 shadow-[inset_0_1px_1px_rgba(255,92,77,0.12)]">
                    {item.icon}
                  </div>
                  <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-accent/80 border border-accent/20 bg-[#000000]/50 px-3 py-1.5 rounded-full backdrop-blur-md whitespace-nowrap ml-4">
                    {item.meta}
                  </span>
                </div>
                
                <div className="max-w-70 relative z-20 bg-[#050505]/40 backdrop-blur-sm rounded-xl p-2 -ml-2">
                  <h3 className="mb-2 font-display text-2xl font-bold tracking-tight text-[#FFFDF9]">
                    {item.title}
                  </h3>
                  <p className="font-body text-sm font-light leading-relaxed text-[#FFFDF9]/60">
                    {item.description}
                  </p>
                </div>
              </div>

              {item.visual && (
                <div className="absolute inset-0 z-0 pointer-events-none">
                  {item.visual}
                </div>
              )}
            </ScrollReveal>
          ))}
        </div>
      </div>
    </ScrollSection>
  );
}