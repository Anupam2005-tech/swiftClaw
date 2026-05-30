"use client";

import React from "react";
import { motion } from "framer-motion";
import { Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

const FOOTER_LINKS = [
    { title: "Documentation", href: "/docs" },
    { title: "FAQs", href: "/faq" },
    { title: "Privacy Policy", href: "/privacy" },
    { title: "Terms & Conditions", href: "/terms" },
];

const smoothEasing = [0.22, 1, 0.36, 1] as const;

// Custom 11x11 Pixel Heart Component
const PixelHeart = () => (
  <motion.svg
    animate={{ scale: [1, 1.3, 1] }}
    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    viewBox="0 0 11 11"
    className="w-3 h-3 mx-1.5 inline-block fill-accent drop-shadow-[0_0_8px_rgba(var(--accent),0.6)]"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="2" y="1" width="2" height="1" />
    <rect x="7" y="1" width="2" height="1" />
    <rect x="1" y="2" width="2" height="1" />
    <rect x="4" y="2" width="3" height="1" />
    <rect x="8" y="2" width="2" height="1" />
    <rect x="0" y="3" width="11" height="3" />
    <rect x="1" y="6" width="9" height="1" />
    <rect x="2" y="7" width="7" height="1" />
    <rect x="3" y="8" width="5" height="1" />
    <rect x="4" y="9" width="3" height="1" />
    <rect x="5" y="10" width="1" height="1" />
  </motion.svg>
);

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    
    <footer className="relative w-full bg-[#030305] text-[#FFFDF9] overflow-hidden pt-32 pb-8 isolate">
      {/* Ambient Background & Grid Lines */}
      <div className="absolute inset-0 z-0 pointer-events-none flex justify-center">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FFFDF9]/10 to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[300px] bg-accent/5 blur-[120px] rounded-[100%]" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 relative z-10 flex flex-col">
        
        {/* Top Section: Branding & Links */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-16 mb-32">
          
          {/* Left: Branding & Credit */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: smoothEasing }}
            className="flex flex-col gap-8"
          >
<div className="flex flex-col gap-8">
  <div className="flex items-center gap-4">
    {/* Terminal Icon only, no container or backdrop */}
    <Terminal className="h-6 w-6 text-accent" />
    
    <div className="flex flex-col">
      <span className="font-display text-2xl font-light tracking-widest ">
        swiftClaw
      </span>
      <span className="font-mono text-[9px] font-thin uppercase tracking-[0.4em] text-[#FFFDF9]/40 mt-1">
        System Core v2.0
      </span>
    </div>
  </div>

  <div className="font-body text-xs md:text-sm font-light text-[#FFFDF9]/50 tracking-wide flex items-center">
    Made with <PixelHeart /> by anupam.
  </div>
</div>
          </motion.div>

          {/* Right: Essential Navigation */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: smoothEasing }}
            className="flex flex-col items-start md:items-end gap-6"
          >
            <div className="font-mono text-[10px] font-thin uppercase tracking-[0.3em] text-[#FFFDF9]/30 mb-2">
              Directory
            </div>
            <ul className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10">
              {FOOTER_LINKS.map((link, index) => (
                <li key={link.title}>
                  <a
                    href={link.href}
                    className="group relative font-display text-sm md:text-base font-light tracking-wide text-[#FFFDF9]/70 transition-colors duration-300 hover:text-[#FFFDF9]"
                  >
                    {link.title}
                    {/* Minimalist Underline Hover */}
                    <span className="absolute -bottom-2 left-0 w-0 h-px bg-accent transition-all duration-500 ease-out group-hover:w-full" />
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Technical Data Tags */}
        <div className="w-full flex justify-between border-b-[0.5px] border-[#FFFDF9]/10 pb-8 mb-8 pointer-events-none select-none">
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#FFFDF9]/20">
            LATENCY // &lt; 2ms
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#FFFDF9]/20">
            ENV // PRODUCTION
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#FFFDF9]/20">
            © {currentYear} ALL RIGHTS RESERVED
          </span>
        </div>

      </div>

      {/* Massive Edge-to-Edge Typography */}
      <motion.div 
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: smoothEasing }}
        className="w-full overflow-hidden flex justify-center px-4 md:px-8 mt-12"
      >
        <h1 className="font-display text-[16vw] md:text-[18vw] leading-[0.8] font-thin tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-[#FFFDF9]/20 via-[#FFFDF9]/5 to-transparent select-none cursor-default transition-all duration-1000 hover:from-[#FFFDF9]/40 hover:via-[#FFFDF9]/10">
          swiftClaw
        </h1>
      </motion.div>

    </footer>
  );
}