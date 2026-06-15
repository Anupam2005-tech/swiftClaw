"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Terminal, ArrowRight, Zap, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// Sassed-up the roadmap data for that premium ego.
const ROADMAP = [
  {
    phase: "01",
    version: "v1.0",
    title: "The Bare Minimum",
    status: "ALIVE & KICKING",
    items: [
      "Agents that actually do what you ask",
      "Zero-Trust Staging (because we don't trust you)",
      "Telegram Remote Gateway",
      "UI Architecture so clean it hurts",
    ],
    active: true,
    icon: Terminal,
  },
  {
    phase: "02",
    version: "v1.1",
    title: "Brain Transplants",
    status: "IN THE OVEN",
    items: [
      "Cross-session memory (we remember everything)",
      "User preference indexing",
      "Contextual token optimization (saving your money)",
    ],
    active: false,
    icon: Terminal,
  },
  {
    phase: "03",
    version: "v1.2",
    title: "Hive Mind Sync",
    status: "GATEKEEPING",
    items: [
      "MCP support for the nerds",
      "GitHub/GitLab bi-directional flex",
      "Jira state awareness (sorry in advance)",
    ],
    active: false,
    icon: Terminal,
  },
  {
    phase: "04",
    version: "v2.0",
    title: "God Mode Swarm",
    status: "HALLUCINATING",
    items: [
      "Real-time video/audio streams",
      "Multi-agent swarm domination",
      "Advanced screen-state reasoning",
    ],
    active: false,
    icon: Terminal,
  },
];

export function RoadmapSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Advanced Scroll Tracking for Real-time Stimulation
  const { scrollYProgress } = useScroll({ 
    target: containerRef, 
    offset: ["start end", "end start"] 
  });
  
  // Smooth the scroll progress so it doesn't jitter like a cheap site
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const backgroundY = useTransform(smoothProgress, [0, 1], ["0%", "150%"]);
  const pathLength = useTransform(smoothProgress, [0.1, 0.9], [0, 1]);
  const glowOpacity = useTransform(smoothProgress, [0.2, 0.5, 0.8], [0, 1, 0]);

  return (
    <section 
      id="roadmap" 
      ref={containerRef}
      className="relative px-4 py-40 sm:px-6 bg-[#030305] text-[#FFFDF9] selection:bg-accent selection:text-background overflow-hidden"
    >
      {/* --- CRAZY AWARD WINNING BACKGROUND STIMULATION --- */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
        {/* Animated Grid Lines */}
        <motion.div 
          style={{ y: backgroundY }} 
          className="absolute inset-0 h-[200%] w-full bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_30%,#000_20%,transparent_100%)]" 
        />
        
        {/* Floating Geometric Shapes */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 -left-32 w-[500px] h-[500px] border-[0.5px] border-accent/20 rounded-full blur-[2px]" 
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 200, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 -right-40 w-[700px] h-[700px] border-[1px] border-dashed border-accent/10 rounded-full" 
        />
        
        {/* Real-time Scroll Glow */}
        <motion.div 
          style={{ opacity: glowOpacity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/10 rounded-full blur-[120px]" 
        />
      </div>

      <div className="mx-auto max-w-7xl relative z-10 pb-32">
        
        {/* --- HEADER: NO BOLD ALLOWED, ONLY HIGH FASHION --- */}
        <div className="mb-40 flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mb-8 flex items-center gap-4"
          >
            <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-accent/60" />
            <span className="font-mono text-[10px] font-light uppercase tracking-[0.5em] text-accent">
              Evolution Protocol
            </span>
            <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-accent/60" />
          </motion.div>
          
          <h2 className="font-display text-5xl sm:text-7xl lg:text-9xl font-thin tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-[#FFFDF9] to-[#FFFDF9]/20 drop-shadow-2xl">
            INFINITE
            <br />
            <span className="italic font-light">SCALE.</span>
          </h2>
        </div>

        {/* --- DIFFERENT UNIQUE LAYOUT: CENTRAL SVG TIMELINE --- */}
        <div className="relative">
          {/* Central Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] -translate-x-1/2 bg-[#FFFDF9]/5 hidden lg:block" />
          
          {/* Animated Draw Line */}
          <svg className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 hidden lg:block" width="2" height="100%" preserveAspectRatio="none">
            <motion.line 
              x1="1" y1="0" x2="1" y2="100%" 
              stroke="url(#accentGradient)" 
              strokeWidth="2"
              style={{ pathLength }}
            />
            <defs>
              <linearGradient id="accentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(var(--accent))" stopOpacity="1" />
                <stop offset="100%" stopColor="rgb(var(--accent))" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>

          <div className="flex flex-col gap-24 lg:gap-40">
            {ROADMAP.map((node, index) => {
              const isEven = index % 2 === 0;
              return (
                <div key={node.phase} className={cn("relative flex items-center justify-center lg:justify-between", isEven ? "flex-row" : "flex-row-reverse")}>
                  
                  {/* Timeline Dot */}
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:flex h-4 w-4 rounded-full bg-[#030305] border-[2px] border-accent z-20 items-center justify-center shadow-[0_0_15px_rgba(var(--accent),0.5)]"
                  >
                    {node.active && <Sparkles className="h-2 w-2 text-accent animate-pulse" />}
                  </motion.div>

                  {/* Empty Spacer for alternating layout */}
                  <div className="hidden lg:block w-[45%]" />

                  {/* THE CARD */}
                  <motion.div
                    initial={{ opacity: 0, x: isEven ? 50 : -50, y: 30 }}
                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="w-full lg:w-[45%] group perspective-1000"
                  >
                    <div className={cn(
                      "relative overflow-hidden rounded-[30px] p-8 sm:p-12 transition-all duration-700",
                      node.active 
                        ? "bg-[#FFFDF9]/[0.02] border-[1px] border-accent/30 shadow-[0_0_40px_rgba(var(--accent),0.1)] backdrop-blur-3xl" 
                        : "bg-[#FFFDF9]/[0.01] border-[1px] border-[#FFFDF9]/5 backdrop-blur-xl hover:border-[#FFFDF9]/20"
                    )}>
                      
                      {/* Inner Decorative Shapes */}
                      <div className="absolute -right-20 -top-20 w-40 h-40 bg-accent/5 rounded-full blur-[40px] group-hover:bg-accent/20 transition-colors duration-700" />
                      
                      {/* Ghost Version Number */}
                      <div className={cn(
                        "absolute -right-6 -bottom-10 font-display text-[150px] leading-none pointer-events-none transition-transform duration-1000 group-hover:-translate-y-4 group-hover:scale-110 font-thin",
                        node.active ? "text-accent/[0.03]" : "text-[#FFFDF9]/[0.02]"
                      )}>
                        {node.version}
                      </div>

                      <div className="relative z-10">
                        {/* Header Area */}
                        <div className="flex justify-between items-start mb-12">
                          <div className={cn(
                            "flex h-12 w-12 items-center justify-center rounded-full border-[0.5px]",
                            node.active ? "bg-accent/10 border-accent/50" : "bg-[#FFFDF9]/5 border-[#FFFDF9]/10"
                          )}>
                            <node.icon className={cn("h-5 w-5", node.active ? "text-accent" : "text-[#FFFDF9]/40")} />
                          </div>
                          
                          <div className={cn(
                            "inline-flex items-center gap-2 rounded-full border-[0.5px] px-4 py-1.5 font-mono text-[9px] font-light uppercase tracking-[0.2em]",
                            node.active ? "border-accent/40 bg-accent/10 text-accent" : "border-[#FFFDF9]/10 bg-transparent text-[#FFFDF9]/50"
                          )}>
                            {node.active ? <Zap className="h-3 w-3 fill-current" /> : <Clock className="h-3 w-3" />}
                            {node.status}
                          </div>
                        </div>

                        {/* Title - STRICTLY NO BOLD */}
                        <h3 className="font-display text-3xl sm:text-4xl font-light tracking-wide leading-tight mb-8">
                          {node.title}
                        </h3>

                        {/* Payload Items */}
                        <div className="space-y-4">
                          <div className="font-mono text-[9px] font-light uppercase tracking-[0.3em] mb-6 text-[#FFFDF9]/30">
                            Payload Execution
                          </div>
                          <ul className="space-y-4">
                            {node.items.map((item, i) => (
                              <li key={i} className="flex items-start gap-4">
                                <ArrowRight className={cn(
                                  "h-4 w-4 shrink-0 mt-0.5 transition-transform duration-300 group-hover:translate-x-1", 
                                  node.active ? "text-accent" : "text-[#FFFDF9]/20"
                                )} />
                                <span className={cn(
                                  "font-body text-sm font-light tracking-wide leading-relaxed", 
                                  node.active ? "text-[#FFFDF9]/90" : "text-[#FFFDF9]/50"
                                )}>
                                  {item}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}