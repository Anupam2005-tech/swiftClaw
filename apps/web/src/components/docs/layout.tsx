"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "./sidebar";
import { DocPagination } from "./pagination";
import { motion } from "framer-motion";
import { Menu, X, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocsLayoutProps {
  children: React.ReactNode;
}

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

export default function DocsLayout({ children }: DocsLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="relative flex min-h-screen w-full bg-[#000000] text-[#FFFDF9] antialiased selection:bg-[#FFFDF9] selection:text-black">
      
      {/* --- PRE-FLIGHT CANVAS DECORATIONS --- */}
       {/* Global Architectural Blueprint Background Grid */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:8rem_8rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none select-none" />

      {/* Subtle top horizontal engine path line */}
      <div className="absolute top-0 right-0 left-14 h-px bg-gradient-to-r from-[#FFFDF9]/15 via-[#FFFDF9]/5 to-transparent pointer-events-none z-10" />

      {/* --- MOBILE HEADER --- */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 z-[1000] border-b border-[#FFFDF9]/10 bg-[#050505]/80 backdrop-blur-md flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className="p-2 rounded-md border border-[#FFFDF9]/10 bg-[#FFFDF9]/5 text-[#FFFDF9] hover:bg-[#FFFDF9]/10 transition-colors"
          >
            {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </button>
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-[#FFFDF9]" />
            <span className="font-display font-black tracking-widest text-[#FFFDF9] text-sm">swiftClaw</span>
          </div>
        </div>
      </div>

      {/* --- YOUR SIDEBAR WORKSPACE NAVIGATION --- */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* --- DYNAMIC CONTENT VIEWPORT CONTAINER --- */}
      <div className={cn(
        "flex-1 min-w-0 transition-all duration-300 ease-in-out relative z-10 flex flex-col",
        "pt-16 lg:pt-0",
        isCollapsed ? "pl-0 lg:pl-14" : "pl-0 lg:pl-64"
      )}>
        
        {/* Main Documentation Content Slot */}
        <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-12 sm:px-12 lg:px-16 lg:py-20 flex flex-col justify-between">
          
          <div className="w-full">
            {children}
            <DocPagination />
          </div>

          {/* --- MINIMAL TECHNICAL FOOTER CONSOLE --- */}
          <footer className="mt-24 pt-6 border-t border-[#FFFDF9]/10 flex flex-col sm:flex-row items-center justify-between gap-4 select-none pointer-events-none">
            <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.2em] text-[#FFFDF9]/30">
              <span>ENGINE REG // SWIFTCLAW_NODE_0x1A</span>
              <span className="text-[#FFFDF9]/10">|</span>
              <span>LATENCY // &lt; 2ms</span>
            </div>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#FFFDF9]/30 text-center sm:text-right">
              © {new Date().getFullYear()} swiftClaw. All rights reserved.
            </p>
            
            <div className="font-body text-xs md:text-sm font-light text-[#FFFDF9]/50 tracking-wide flex items-center">
    Made with <PixelHeart /> by anupam.
  </div>
          </footer>

        </main>
      </div>

    </div>
  );
}
