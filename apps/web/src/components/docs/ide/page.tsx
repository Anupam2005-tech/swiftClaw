"use client";

import React from "react";
import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { Monitor, Layers, ArrowRight, Layout, Code, Cpu } from "lucide-react";

export default function IdePage() {
  return (
    <ScrollReveal className="space-y-12 selection:bg-[#FFFDF9] selection:text-black">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-[#FFFDF9]/40 select-none pointer-events-none">
        <span>Core</span>
        <ArrowRight className="h-3 w-3 opacity-30" />
        <span className="text-[#FFFDF9]/80">IDE Integration</span>
      </div>

      <header className="space-y-4 border-b border-[#FFFDF9]/10 pb-8">
        <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-[#FFFDF9]">
          Seamless Workspace.
        </h1>
        <p className="font-body text-base font-light leading-relaxed text-[#FFFDF9]/60 max-w-2xl">
          Integrating swiftClaw into your existing editor allows for a fluid transition between manual coding and autonomous agent orchestration.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-[#FFFDF9]/10 bg-[#0A0A0A]/60 p-6 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#FFFDF9]/10 to-transparent" />
          <Layout className="h-5 w-5 text-[#FFFDF9] mb-4 opacity-70 group-hover:opacity-100 transition-opacity" />
          <h3 className="font-display text-lg font-bold text-[#FFFDF9] mb-2">Visual Diffing</h3>
          <p className="font-body text-xs font-light leading-relaxed text-[#FFFDF9]/50">
            Our IDE plugin provides a native visual diff of the staging area, allowing you to review every character change before applying it to your source files.
          </p>
        </div>
        <div className="rounded-2xl border border-[#FFFDF9]/10 bg-[#0A0A0A]/60 p-6 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#FFFDF9]/10 to-transparent" />
          <Layers className="h-5 w-5 text-[#FFFDF9] mb-4 opacity-70 group-hover:opacity-100 transition-opacity" />
          <h3 className="font-display text-lg font-bold text-[#FFFDF9] mb-2">Contextual Awareness</h3>
          <p className="font-body text-xs font-light leading-relaxed text-[#FFFDF9]/50">
            The agent understands your open tabs and cursor position, allowing you to prompt with "fix this function" without needing to specify the file path.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#FFFDF9]/40 select-none pointer-events-none">
          <Code className="h-3 w-3" />
          <span>Supported Environments</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {["VS Code", "JetBrains", "Neovim"].map((ide) => (
            <div key={ide} className="rounded-xl border border-[#FFFDF9]/10 bg-[#050505] p-4 text-center font-mono text-xs text-[#FFFDF9]">
              {ide}
            </div>
          ))}
        </div>
      </section>

      <blockquote className="border-l border-[#FFFDF9]/30 bg-[#FFFDF9]/[0.02] p-4 rounded-r-xl">
        <p className="font-body text-xs font-light italic leading-relaxed text-[#FFFDF9]/60">
          "Note: IDE integration requires the swiftClaw daemon to be running in the background to facilitate communication between the editor and the agent."
        </p>
      </blockquote>
    </ScrollReveal>
  );
}
