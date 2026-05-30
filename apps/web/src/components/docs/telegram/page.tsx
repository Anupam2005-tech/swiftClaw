"use client";

import React from "react";
import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { MessageSquare, Radio, ArrowRight, Globe, Smartphone, Lock } from "lucide-react";

export default function TelegramPage() {
  return (
    <ScrollReveal className="space-y-12 selection:bg-[#FFFDF9] selection:text-black">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-[#FFFDF9]/40 select-none pointer-events-none">
        <span>Core</span>
        <ArrowRight className="h-3 w-3 opacity-30" />
        <span className="text-[#FFFDF9]/80">Telegram Gateway</span>
      </div>

      <header className="space-y-4 border-b border-[#FFFDF9]/10 pb-8">
        <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-[#FFFDF9]">
          Remote Governance.
        </h1>
        <p className="font-body text-base font-light leading-relaxed text-[#FFFDF9]/60 max-w-2xl">
          Control your autonomous agents from anywhere. The Telegram Gateway allows for secure remote monitoring and manual approval of staged changes.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-[#FFFDF9]/10 bg-[#0A0A0A]/60 p-6 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#FFFDF9]/10 to-transparent" />
          <MessageSquare className="h-5 w-5 text-[#FFFDF9] mb-4 opacity-70 group-hover:opacity-100 transition-opacity" />
          <h3 className="font-display text-lg font-bold text-[#FFFDF9] mb-2">Interactive Approval</h3>
          <p className="font-body text-xs font-light leading-relaxed text-[#FFFDF9]/50">
            When an agent proposes a mutation, receive a detailed diff in your Telegram chat. Approve, reject, or request modifications with simple inline buttons.
          </p>
        </div>
        <div className="rounded-2xl border border-[#FFFDF9]/10 bg-[#0A0A0A]/60 p-6 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#FFFDF9]/10 to-transparent" />
          <Radio className="h-5 w-5 text-[#FFFDF9] mb-4 opacity-70 group-hover:opacity-100 transition-opacity" />
          <h3 className="font-display text-lg font-bold text-[#FFFDF9] mb-2">Real-time Telemetry</h3>
          <p className="font-body text-xs font-light leading-relaxed text-[#FFFDF9]/50">
            Monitor agent health, token consumption, and task progress through a dedicated bot interface without needing to SSH into your machine.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#FFFDF9]/40 select-none pointer-events-none">
          <Lock className="h-3 w-3" />
          <span>Authentication Flow</span>
        </div>
        <div className="relative overflow-hidden rounded-xl border border-[#FFFDF9]/15 bg-[#050505] p-5 font-mono text-xs sm:text-sm text-[#FFFDF9]">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="text-[#FFFDF9]/30">01</span>
              <span>Generate Gateway Token via CLI: <code className="text-[#FFFDF9]/60">swiftclaw gateway init</code></span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[#FFFDF9]/30">02</span>
              <span>Link your Telegram ID through the secure bot handshake.</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[#FFFDF9]/30">03</span>
              <span>Enable remote approval in your config file.</span>
            </div>
          </div>
        </div>
      </section>

      <blockquote className="border-l border-[#FFFDF9]/30 bg-[#FFFDF9]/[0.02] p-4 rounded-r-xl">
        <p className="font-body text-xs font-light italic leading-relaxed text-[#FFFDF9]/60">
          "Security Warning: We recommend enabling 2FA on your Telegram account and restricting the Gateway to specific authorized IDs only."
        </p>
      </blockquote>
    </ScrollReveal>
  );
}
