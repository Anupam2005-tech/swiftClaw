"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { ArrowRight, Plus } from "lucide-react";

const smoothEasing = [0.22, 1, 0.36, 1] as const;

export default function FAQPage() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "What makes swiftClaw different from other terminal agents?",
      answer: "swiftClaw is designed with a zero-trust architecture where every filesystem mutation is compiled inside an isolated virtual staging area. Your live production directories remain completely untouched until you physically authenticate the payload, ensuring no accidental overwrites or unauthorized changes."
    },
    {
      question: "How does the staging mechanism work in swiftClaw?",
      answer: "swiftClaw operates in a dual-mode system: Plan Mode maps complex structural architectures across microservices, while Ask Mode executes structural, completely read-only system queries. Changes are never applied to your live system without explicit human confirmation through our clearance protocol."
    },
    {
      question: "Is my data secure when using swiftClaw?",
      answer: "Yes. swiftClaw operates purely within local workspace runtimes. It maps context schemas locally and contacts upstream inference engines exclusively via user-provided keys. No telemetry is collected, and all processing happens on your machine."
    },
    {
      question: "What programming languages and frameworks does swiftClaw support?",
      answer: "swiftClaw is language-agnostic and works with any codebase. It understands project structures through AST parsing and works with JavaScript/TypeScript, Python, Go, Rust, Java, C/C++, and more. The agent adapts to your specific tech stack through contextual awareness."
    },
    {
      question: "How does the Telegram Gateway integration work?",
      answer: "The Telegram Gateway allows for secure remote monitoring and manual approval of staged changes. You generate a gateway token via CLI, link your Telegram ID through a secure bot handshake, and then receive detailed diffs in your Telegram chat for interactive approval workflows."
    },
    {
      question: "Can I create custom skills for swiftClaw?",
      answer: "Absolutely. Skills are modular capabilities that extend the agent's cognitive reach. You can define your own skills using simple YAML definitions or TypeScript scripts to teach the agent how to interact with internal APIs or proprietary tools specific to your organization."
    },
    {
      question: "What are the system requirements for running swiftClaw?",
      answer: "swiftClaw requires Node.js 18+ or Bun 1.0+ for the CLI, and runs on Windows, macOS, and Linux. For the full experience, we recommend 8GB RAM minimum and a modern multi-core processor. The sandboxed runtime is designed to be lightweight and efficient."
    },
    {
      question: "How do I contribute to the swiftClaw project?",
      answer: "We welcome contributions! Check out our GitHub repository for contribution guidelines. You can contribute through code improvements, documentation, skill development, or community support. All contributions go through our standard pull request review process."
    }
  ];

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const cn = (...inputs: any[]) => inputs.filter(Boolean).join(" ");
  return (
    <>
      {/* PREMIUM BACKGROUND 
        Pitch black base with a subtle cream-white (#FAF9F6) grid.
        Uses a radial gradient mask to fade the grid out beautifully at the edges.
      */}
      <div className="fixed inset-0 -z-10 bg-black">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#FAF9F608_1px,transparent_1px),linear-gradient(to_bottom,#FAF9F608_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_30%,#000_40%,transparent_100%)]"></div>
      </div>

      <div className="relative w-full min-h-screen bg-[#000000] text-[#FFFDF9] overflow-hidden isolate py-32 px-4 sm:px-6 lg:px-8 pt-[60px]">
        {/* ================= INTERACTIVE MAIN CANVAS ================= */}
        <ScrollReveal className="relative z-10 w-full max-w-4xl mx-auto space-y-16">
          
          {/* Header Block with Anchor Crosshairs */}
          <div className="relative space-y-4 pb-4">
            {/* Subtle Corner Graphic Markers to anchor layout balance */}
            <div className="absolute top-0 -left-6 font-mono text-[10px] text-white/30 sm:block hidden">+</div>
            <div className="absolute top-0 -right-6 font-mono text-[10px] text-white/30 sm:block hidden">+</div>

            {/* Nav Indicator */}
            <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.3em] text-white/40">
              <span>Core</span>
              <ArrowRight className="h-2.5 w-2.5 opacity-40 text-white" />
              <span className="text-white/80">System Documentation</span>
            </div>

            {/* Typography Grid */}
            <div className="space-y-2">
              <h1 className="font-display text-4xl sm:text-5xl font-extralight tracking-tight text-white">
                Common <span className="font-medium text-white">Questions.</span>
              </h1>
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/30">
                // INDEX_ID: 0x98A12F // VERSION 2.0
              </p>
            </div>
          </div>

          {/* Dynamic Accordion System */}
          <div className="border-t border-white/10 divide-y divide-white/10">
            {faqs.map((faq, index) => {
              const isOpen = activeIndex === index;
              return (
                <div key={index} className="group relative transition-all duration-300">
                  
                  {/* Master Accordion Row Trigger */}
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="flex w-full items-start justify-between gap-6 py-7 text-left outline-none cursor-pointer group"
                  >
                    {/* Perfect Column Alignment Frame */}
                    <div className="flex items-start flex-1 min-w-0">
                      
                      {/* Fixed Structural Left Column (Guarantees X-Alignment) */}
                      <span className="font-mono text-xs text-white/30 w-12 shrink-0 pt-0.5 select-none transition-colors duration-300 group-hover:text-white/80 tabular-nums">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      
                      {/* Main Flow Right Column */}
                      <span className={cn(
                        "font-display text-base sm:text-lg tracking-tight pr-4 transition-colors duration-300 flex-1",
                        isOpen ? "text-white font-normal" : "text-white/60 group-hover:text-white"
                      )}>
                        {faq.question}
                      </span>
                    </div>

                    {/* Micro-Interaction Mechanical Node */}
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.01] group-hover:border-white/40 group-hover:bg-white/[0.03] transition-all duration-300">
                      <motion.div
                        animate={{ rotate: isOpen ? 135 : 0 }}
                        transition={{ duration: 0.35, ease: smoothEasing }}
                      >
                        <Plus className={cn("h-3.5 w-3.5 transition-colors duration-300", isOpen ? "text-white" : "text-white/40 group-hover:text-white")} />
                      </motion.div>
                    </div>
                  </button>

                  {/* Animated Drawer Body */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ 
                          height: "auto", 
                          opacity: 1,
                          transition: { height: { duration: 0.4, ease: smoothEasing }, opacity: { duration: 0.25, delay: 0.05 } }
                        }}
                        exit={{ 
                          height: 0, 
                          opacity: 0,
                          transition: { height: { duration: 0.35, ease: smoothEasing }, opacity: { duration: 0.15 } }
                        }}
                        className="overflow-hidden"
                      >
                        {/* Left Padding matches structural width (w-12) to lock alignment grid line */}
                        <div className="pl-12 pr-12 pb-7 font-body text-sm sm:text-base text-white/50 font-light leading-relaxed tracking-wide max-w-3xl">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Geometric Callout Module */}
          <blockquote className="relative border-l border-white/30 bg-gradient-to-r from-white/[0.01] to-transparent p-6 rounded-r-xl mt-12 overflow-hidden">
            {/* Accent graphic border strip */}
            <div className="absolute top-0 bottom-0 left-0 w-[1px] bg-gradient-to-b from-white/40 via-white/10 to-transparent" />
            <div className="absolute top-0 right-0 p-3 font-mono text-[7px] uppercase tracking-[0.2em] text-white/10 select-none">
              // CONTEXT_ROUTING
            </div>
            <p className="font-body text-xs font-light italic leading-relaxed text-white/50 max-w-2xl">
              &quot;Still have questions? Reach out to our community on GitHub Discussions or join our Telegram channel for real-time support from the swiftClaw team and fellow developers.&quot;
            </p>
          </blockquote>
        </ScrollReveal>
      </div>
    </>
  );
}