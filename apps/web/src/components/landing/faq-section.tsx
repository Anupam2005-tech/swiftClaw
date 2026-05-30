"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, TerminalSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollReveal, ScrollSection } from "@/components/landing/scroll-reveal";

const FAQ_ITEMS = [
  { q: "Will this delete my production database?", a: "No — because we actually implemented a staging sandbox, unlike your last intern. Nothing hits the live disk until you explicitly approve the diff." },
  { q: "How is this different from other AI coding tools?", a: "swiftClaw treats you like an orchestra conductor, not a passive observer. Agent, Plan, and Ask modes all execute behind an impenetrable zero-trust memory staging engine." },
  { q: "Can I approve changes from my phone?", a: "Yes. The Telegram Gateway pushes diff previews with inline ✅ Approve and ❌ Reject buttons directly to your device. It is strictly locked to your TELEGRAM_OWNER_ID." },
  { q: "Does swiftClaw send my code to external servers?", a: "Your code stays local. The staging engine prevents writes without human confirmation. Web search uses external APIs only when you explicitly configure the keys." },
  { q: "What package managers are supported?", a: "npm, pnpm, bun — pick your poison. Or curl the universal install script and pretend you're a DevOps hero." },
];

function FaqItem({ item, isOpen, onClick, index }: { item: typeof FAQ_ITEMS[0], isOpen: boolean, onClick: () => void, index: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="border-b border-[#FFFDF9]/10 last:border-0">
      <button onClick={onClick} className="group flex w-full items-center justify-between py-6 text-left outline-none">
        <span className={cn("font-display text-lg sm:text-xl font-bold tracking-tight transition-colors duration-300", isOpen ? "text-[#FFFDF9]" : "text-[#FFFDF9]/70 group-hover:text-[#FFFDF9]")}>{item.q}</span>
        <div className={cn("ml-6 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-500", isOpen ? "border-accent bg-accent text-accent-foreground rotate-45" : "border-accent/20 bg-transparent text-[#FFFDF9]/60 group-hover:border-accent/50 group-hover:text-accent")}>
          <Plus className="h-4 w-4" />
        </div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div className="overflow-hidden" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto" as const, opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ type: "spring", duration: 0.5, bounce: 0 }}>
            <div className="pb-8 pr-12 font-body text-sm font-light leading-relaxed text-[#FFFDF9]/50">
              {item.a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <ScrollSection id="faq" className="relative px-4 py-32 sm:px-6 bg-background selection:bg-accent selection:text-background isolate">
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(248,247,251,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(248,247,251,0.05)_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_50%_50%_at_50%_50%,rgba(5,4,13,0.6),transparent_100%)] pointer-events-none" />
      <div className="mx-auto max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
          <div className="lg:col-span-5 relative">
            <div className="sticky top-32">
              <ScrollReveal>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3.5 py-1.5 backdrop-blur-xl">
                  <TerminalSquare className="h-3.5 w-3.5 text-accent" />
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-accent">System Queries</span>
                </div>
                <h2 className="font-display text-5xl sm:text-7xl font-black tracking-tight text-[#FFFDF9] mb-6">The <br className="hidden lg:block" />Interrogation.</h2>
                <p className="font-body text-sm font-light leading-relaxed text-[#FFFDF9]/50 max-w-md">You've got questions about letting an autonomous AI agent roam through your production repositories. We don't blame you. Here is exactly how we keep it chained.</p>
              </ScrollReveal>
            </div>
          </div>
          <div className="lg:col-span-7">
            <ScrollReveal delay={0.2} className="relative rounded-[32px] border border-sc-text/10 bg-background/40 p-6 sm:p-10 backdrop-blur-md shadow-[0_0_40px_rgba(0,0,0,0.5)]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-linear-to-r from-transparent via-[#FFFDF9]/20 to-transparent" />
              <div className="flex flex-col">
                {FAQ_ITEMS.map((item, i) => (
                  <FaqItem key={i} index={i} item={item} isOpen={openIndex === i} onClick={() => setOpenIndex(openIndex === i ? null : i)} />
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </ScrollSection>
  );
}