"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Terminal, Database, Network, Waves, ArrowRight, Zap, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollReveal, ScrollSection } from "@/components/landing/scroll-reveal";

const ROADMAP = [
  {
    phase: "01",
    version: "v1.0",
    title: "The Foundation",
    status: "SYSTEM_ACTIVE",
    items: ["Agent, Plan & Ask operational modes", "Zero-Trust Staging Engine", "Telegram Remote Gateway", "Premium Web UI Architecture"],
    active: true,
    icon: Terminal,
  },
  {
    phase: "02",
    version: "v1.1",
    title: "Memory Integration",
    status: "IN_QUEUE",
    items: ["Persistent cross-session context", "User preference memory indexing", "Contextual token optimization"],
    active: false,
    icon: Database,
  },
  {
    phase: "03",
    version: "v1.2",
    title: "Workspace Sync",
    status: "LOCKED",
    items: ["Model Context Protocol (MCP) support", "GitHub / GitLab bi-directional sync", "Jira ticket state awareness"],
    active: false,
    icon: Network,
  },
  {
    phase: "04",
    version: "v2.0",
    title: "Multimodal Swarm",
    status: "HORIZON",
    items: ["Real-time video & audio input streams", "Multi-agent swarm collaboration", "Advanced screen-state reasoning"],
    active: false,
    icon: Waves,
  },
];

export function RoadmapSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <ScrollSection id="roadmap" className="relative px-4 py-32 sm:px-6 bg-background selection:bg-accent selection:text-background isolate">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div style={{ y: backgroundY }} className="absolute inset-0 h-[200%] w-full bg-[linear-gradient(to_right,rgba(248,247,251,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(248,247,251,0.06)_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_100%_100%_at_50%_0%,rgba(5,4,13,0.4),transparent_100%)]" />
      </div>

      <div ref={containerRef} className="mx-auto max-w-6xl relative z-10 pb-32">
        <ScrollReveal className="mb-32 flex flex-col items-center text-center">
          <div className="mb-8 flex items-center gap-3">
            <div className="h-px w-12 bg-linear-to-r from-transparent to-accent/40" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-accent/60">Evolution Architecture</span>
            <div className="h-px w-12 bg-linear-to-l from-transparent to-accent/40" />
          </div>
          <h2 className="font-display text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-[#FFFDF9] drop-shadow-2xl">
            Infinite Scale.
          </h2>
        </ScrollReveal>

        <div className="relative flex flex-col gap-6">
          {ROADMAP.map((node, index) => {
            const stickyTop = `calc(6rem + ${index * 24}px)`;
            return (
              <motion.div
                key={node.phase}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="sticky shadow-2xl transition-all duration-500"
                style={{ top: stickyTop }}
              >
                <div className={cn(
                  "relative overflow-hidden rounded-[40px] border p-8 sm:p-12 md:p-16 w-full min-h-100 flex flex-col lg:flex-row gap-12 lg:gap-8 justify-between",
                  node.active ? "bg-sc-text border-transparent text-background" : "bg-[#14141d] border-sc-text/10 text-sc-text backdrop-blur-2xl"
                )}>
                  <div className={cn(
                    "absolute -right-10 -bottom-20 font-display font-black tracking-tighter leading-none pointer-events-none transition-transform duration-700 hover:scale-105",
                    node.active ? "text-[#000000]/3 text-[280px]" : "text-[#FFFDF9]/2 text-[280px]"
                  )}>
                    {node.version}
                  </div>
                  {node.active && <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-[#000000]/20 to-transparent" />}

                  <div className="relative z-10 flex flex-col items-start lg:w-1/3">
                    <div className={cn(
                      "mb-12 flex h-16 w-16 items-center justify-center rounded-2xl border",
                      node.active ? "bg-background border-background" : "bg-sc-text/5 border-sc-text/10"
                    )}>
                      <node.icon className={cn("h-6 w-6", node.active ? "text-[#FFFDF9]" : "text-[#FFFDF9]/60")} />
                    </div>
                    <div className={cn(
                      "mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-mono text-[9px] font-bold uppercase tracking-widest",
                      node.active ? "border-accent/20 bg-accent/10 text-accent" : "border-accent/10 bg-accent/5 text-accent/60"
                    )}>
                      {node.active ? <Zap className="h-3 w-3 fill-current" /> : <Clock className="h-3 w-3" />}
                      {node.status}
                    </div>
                    <h3 className="font-display text-4xl sm:text-5xl font-black tracking-tight leading-none mb-4">{node.title}</h3>
                    <div className={cn("font-mono text-xs uppercase tracking-widest mt-auto", node.active ? "text-[#000000]/40" : "text-[#FFFDF9]/30")}>
                      Phase // {node.phase}
                    </div>
                  </div>

                  <div className="relative z-10 flex flex-col justify-center lg:w-1/2">
                    <div className="space-y-6">
                      <div className={cn("font-mono text-[10px] font-bold uppercase tracking-[0.2em] mb-8 pb-4 border-b", node.active ? "border-[#000000]/10 text-[#000000]/40" : "border-[#FFFDF9]/10 text-[#FFFDF9]/30")}>
                        Deployment Payload
                      </div>
                      <ul className="space-y-6">
                        {node.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-4 group/item">
                            <div className={cn("mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors", node.active ? "border-accent/20 bg-accent/10 text-accent" : "border-accent/10 bg-accent/5 text-accent/60")}>
                              <ArrowRight className="h-3 w-3" />
                            </div>
                            <span className={cn("font-body text-base font-medium leading-relaxed", node.active ? "text-[#000000]/80" : "text-[#FFFDF9]/60")}>
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </ScrollSection>
  );
}