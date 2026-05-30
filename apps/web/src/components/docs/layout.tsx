"use client";

import React from "react";
// Adjust this import path if your Sidebar component sits somewhere else 
// (e.g., "@/components/ui/sidebar" or "@/components/landing/sidebar")
import {Sidebar}  from "../ui/sidebar";
interface DocsLayoutProps {
  children: React.ReactNode;
}

export default function DocsLayout({ children }: DocsLayoutProps) {
  return (
    <div className="relative flex min-h-screen w-full bg-[#000000] text-[#FFFDF9] antialiased selection:bg-[#FFFDF9] selection:text-black">
      
      {/* --- PRE-FLIGHT CANVAS DECORATIONS --- */}
       {/* Global Architectural Blueprint Background Grid */}
       <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none select-none" />

      {/* Subtle top horizontal engine path line */}
      <div className="absolute top-0 right-0 left-14 h-px bg-gradient-to-r from-[#FFFDF9]/15 via-[#FFFDF9]/5 to-transparent pointer-events-none z-10" />

      {/* --- YOUR SIDEBAR WORKSPACE NAVIGATION --- */}
      <Sidebar />

      {/* --- DYNAMIC CONTENT VIEWPORT CONTAINER --- */}
      {/* pl-14 handles your standard collapsed sidebar width (3.5rem / 56px) 
          so your text content sits cleanly flush with its right edge.
      */}
      <div className="flex-1 min-w-0 pl-14 transition-all duration-300 ease-in-out relative z-10 flex flex-col">
        
        {/* Main Documentation Content Slot */}
        <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-12 sm:px-12 lg:px-16 lg:py-20 flex flex-col justify-between">
          
          <div className="w-full">
            {children}
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
          </footer>

        </main>
      </div>

    </div>
  );
}