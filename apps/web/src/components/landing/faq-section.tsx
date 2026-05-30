"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import { Plus, Fingerprint, Crosshair } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQ_ITEMS = [
  { 
    id: "01",
    q: "Are you going to nuke my prod database?", 
    a: "Only if you ask nicely. Just kidding. Unlike your last intern, our zero-trust sandbox actually works. Nothing touches the live disk until you explicitly, manually sign off on the diff." 
  },
  { 
    id: "02",
    q: "Why should I use this over [Insert Generic AI]?", 
    a: "Because we don't treat you like a toddler. You are the dictator; the AI is your swarm. Complete architectural control, isolated staging, and absolutely zero auto-deploy jumpscares." 
  },
  { 
    id: "03",
    q: "Can I merge PRs from the club?", 
    a: "Obviously. Our Telegram Gateway pushes diff previews straight to your phone with inline ✅ / ❌ buttons. It’s strictly locked to your ID, so your friends can't drunk-deploy your backend." 
  },
  { 
    id: "04",
    q: "Are you stealing my spaghetti code?", 
    a: "Trust us, nobody wants to steal your code. It stays strictly local. The engine physically cannot write without human confirmation, and we only ping external APIs when you literally hand over the keys." 
  },
  { 
    id: "05",
    q: "Do you support my niche package manager?", 
    a: "npm, pnpm, bun — pick your poison. Or just curl the universal install script and pretend you're a 10x DevOps wizard. We don't judge. Much." 
  },
];

// Custom buttery easing curve
const smoothEasing = [0.22, 1, 0.36, 1] as const;

function FaqItem({ item, isOpen, onClick, index }: { item: typeof FAQ_ITEMS[0], isOpen: boolean, onClick: () => void, index: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      whileInView={{ opacity: 1, y: 0 }} 
      viewport={{ once: true, margin: "-5%" }} 
      transition={{ duration: 0.8, delay: index * 0.15, ease: smoothEasing }} 
      className="relative group"
    >
      {/* Dynamic Hover / Active State Background */}
        <div className={cn(
          "absolute inset-0 rounded-2xl transition-all duration-700 pointer-events-none",
          isOpen ? "bg-[#FFFDF9]/2 border-[0.5px] border-accent/20 shadow-[0_0_40px_rgba(var(--accent),0.05)]" : "bg-transparent border-[0.5px] border-transparent group-hover:border-[#FFFDF9]/5 group-hover:bg-[#FFFDF9]/1"
        )} />

      <button 
        onClick={onClick} 
        className="relative z-10 flex w-full items-start md:items-center justify-between p-5 md:p-6 text-left outline-none"
      >
        <div className="flex items-start md:items-center gap-5 md:gap-6">
          <span className={cn(
            "font-mono text-[9px] font-thin uppercase tracking-[0.4em] transition-colors duration-500 mt-1 md:mt-0 hidden sm:block",
            isOpen ? "text-accent" : "text-[#FFFDF9]/20"
          )}>
            {item.id}
          </span>
          <span className={cn(
            "font-display text-lg md:text-xl font-light tracking-wide transition-all duration-500", 
            isOpen ? "text-[#FFFDF9] translate-x-1" : "text-[#FFFDF9]/60 group-hover:text-[#FFFDF9]/90 group-hover:translate-x-1"
          )}>
            {item.q}
          </span>
        </div>
        
        <div className={cn(
          "ml-6 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-[0.5px] transition-all duration-700", 
          isOpen 
            ? "border-accent bg-accent/10 text-accent rotate-135 shadow-[0_0_20px_rgba(var(--accent),0.2)]" 
            : "border-[#FFFDF9]/10 bg-transparent text-[#FFFDF9]/30 group-hover:border-[#FFFDF9]/40 group-hover:text-[#FFFDF9] group-hover:scale-110"
        )}>
          <Plus className="h-3 w-3" />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0, y: -10, filter: "blur(8px)" }} 
            animate={{ height: "auto", opacity: 1, y: 0, filter: "blur(0px)" }} 
            exit={{ height: 0, opacity: 0, y: -10, filter: "blur(8px)" }} 
            transition={{ duration: 0.7, ease: smoothEasing }}
            className="overflow-hidden relative z-10"
          >
             <div className="pb-6 px-5 md:px-6 md:pl-22 font-body text-sm font-light leading-relaxed text-[#FFFDF9]/40">
                 <motion.div 
                   initial={{ scaleX: 0 }}
                   animate={{ scaleX: 1 }}
                   transition={{ duration: 0.7, delay: 0.1, ease: smoothEasing }}
                   className="w-6 h-px bg-accent/40 mb-4 origin-left" 
                 />
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2, ease: smoothEasing }}
              >
                {item.a}
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // High-end real-time scroll tracking
  const { scrollYProgress } = useScroll({ 
    target: containerRef, 
    offset: ["start end", "end start"] 
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 40, damping: 25, restDelta: 0.001 });
  const lineY = useTransform(smoothProgress, [0, 1], ["-50%", "150%"]);
  const rotateShape = useTransform(smoothProgress, [0, 1], [0, 120]);
  const parallaxY = useTransform(smoothProgress, [0, 1], ["0%", "20%"]);

  return (
    <section 
      id="faq" 
      ref={containerRef}
      className="relative px-4 py-32 sm:px-6 bg-[#030305] selection:bg-accent selection:text-background overflow-hidden isolate"
    >
      {/* Crazy Award-Winning Background Components */}
      <div className="absolute inset-0 z-0 pointer-events-none flex justify-center">
        {/* Vertical tracking lines */}
         <div className="absolute left-1/4 top-0 bottom-0 w-px bg-linear-to-b from-transparent via-[#FFFDF9]/3 to-transparent hidden lg:block" />
         <div className="absolute right-1/4 top-0 bottom-0 w-px bg-linear-to-b from-transparent via-[#FFFDF9]/3 to-transparent hidden lg:block" />
         
         {/* Animated Scroll Tracker */}
         <motion.div 
           style={{ top: lineY }}
           className="absolute left-1/4 w-px h-40 bg-linear-to-b from-transparent via-accent/80 to-transparent shadow-[0_0_20px_rgba(var(--accent),0.8)] hidden lg:block" 
        />

        {/* Floating Geometric Wireframes with continuous idle animation */}
         <motion.div 
           style={{ rotate: rotateShape }}
           animate={{ y: [0, -20, 0], scale: [1, 1.02, 1] }}
           transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
           className="absolute -right-64 top-1/4 w-[600px] h-[600px] border-[#FFFDF9]/5 rounded-full opacity-50 blur-[1px]" 
         />
         <motion.div 
           style={{ rotate: rotateShape }}
           animate={{ y: [0, 20, 0], scale: [0.8, 0.82, 0.8] }}
           transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
           className="absolute -right-64 top-1/4 w-[600px] h-[600px] border border-dashed border-accent/10 rounded-full opacity-30" 
        />
      </div>

      <div className="mx-auto max-w-6xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          {/* Left Column - Sticky Header */}
          <div className="lg:col-span-5 relative">
            <div className="sticky top-40">
              <motion.div 
                style={{ y: parallaxY }}
                initial={{ opacity: 0, filter: "blur(10px)" }}
                whileInView={{ opacity: 1, filter: "blur(0px)" }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: smoothEasing }}
              >
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: smoothEasing }}
                  className="mb-8 inline-flex items-center gap-3 rounded-full border-[0.5px] border-accent/20 bg-accent/5 px-3 py-1.5 backdrop-blur-2xl"
                >
                  <Fingerprint className="h-3 w-3 text-accent" />
                  <span className="font-mono text-[8px] font-light uppercase tracking-[0.4em] text-accent">Paranoia Mitigation</span>
                </motion.div>
                
                {/* REDUCED SIZE. ZERO BOLD TEXT. ONLY THIN & LIGHT. */}
                 <h2 className="font-display text-4xl sm:text-5xl lg:text-7xl font-thin tracking-tight text-transparent bg-clip-text bg-linear-to-b from-[#FFFDF9] to-[#FFFDF9]/30 mb-8 leading-[0.9]">
                  THE <br />
                  <span className="italic font-light">TRUTH.</span>
                </h2>
                
                 <p className="font-body text-sm font-light leading-relaxed text-[#FFFDF9]/40 max-w-xs">
                   You&apos;ve got questions about letting an autonomous AI agent roam through your production repositories. We don&apos;t blame you. Here is exactly how we keep the beast chained.
                 </p>

                {/* Decorative Tech Element */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.6 }}
                  className="mt-12 flex items-center gap-3 text-[#FFFDF9]/20 font-mono text-[9px] tracking-[0.3em] uppercase"
                >
                  <Crosshair className="h-3 w-3 animate-pulse text-accent/50" />
                  <span>System Integrity Verified</span>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Right Column - The Interactive Accordion Grid */}
          <div className="lg:col-span-7 relative pt-8 lg:pt-0">
            {/* Top glass gradient fade */}
             <div className="absolute top-0 left-0 right-0 h-16 bg-linear-to-b from-[#030305] to-transparent z-20 pointer-events-none" />
            
            <motion.div 
              className="flex flex-col gap-1 relative z-10"
            >
              {FAQ_ITEMS.map((item, i) => (
                <FaqItem 
                  key={item.id} 
                  index={i} 
                  item={item} 
                  isOpen={openIndex === i} 
                  onClick={() => setOpenIndex(openIndex === i ? null : i)} 
                />
              ))}
            </motion.div>
            
            {/* Bottom glass gradient fade */}
             <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-[#030305] to-transparent z-20 pointer-events-none" />
          </div>
          
        </div>
      </div>
    </section>
  );
}