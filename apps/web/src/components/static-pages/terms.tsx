import React from "react";
import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { 
  FileText, 
  ArrowRight, 
  Shield, 
  Terminal,
  Zap
} from "lucide-react";

export default function TermsPage() {
  return (
    <ScrollReveal className="space-y-8 selection:bg-[#FFFDF9] selection:text-black">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-[#FFFDF9]/40 select-none pointer-events-none">
        <span>Core</span>
        <ArrowRight className="h-3 w-3 opacity-30" />
        <span className="text-[#FFFDF9]/80">Terms of Service</span>
      </div>

      <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-[#FFFDF9] mb-6">
        Terms of Service.
      </h1>

      <div className="space-y-6">
        <div className="border border-[#FFFDF9]/10 rounded-xl overflow-hidden">
          <div className="px-6 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[#FFFDF9]/40 select-none pointer-events-none bg-[#0A0A0A]/20">
            <span>Acceptance of Terms</span>
          </div>
          <div className="px-6 py-4 text-[#FFFDF9]/60 font-body text-sm leading-relaxed">
            By accessing or using swiftClaw, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, you may not use the Software.
          </div>
        </div>
        
        <div className="border border-[#FFFDF9]/10 rounded-xl overflow-hidden">
          <div className="px-6 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[#FFFDF9]/40 select-none pointer-events-none bg-[#0A0A0A]/20">
            <span>License Grant</span>
          </div>
          <div className="px-6 py-4 text-[#FFFDF9]/60 font-body text-sm leading-relaxed">
            Subject to your compliance with these Terms, swiftClaw grants you a limited, non-exclusive, non-transferable, revocable license to install and use the Software solely for your personal, non-commercial or internal business purposes.
          </div>
        </div>
        
        <div className="border border-[#FFFDF9]/10 rounded-xl overflow-hidden">
          <div className="px-6 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[#FFFDF9]/40 select-none pointer-events-none bg-[#0A0A0A]/20">
            <span>User Obligations</span>
          </div>
          <div className="px-6 py-4 text-[#FFFDF9]/60 font-body text-sm leading-relaxed">
            You agree to use the Software only for lawful purposes and in accordance with these Terms. You are responsible for maintaining the confidentiality of your account and API keys, and for all activities that occur under your account.
          </div>
        </div>
        
        <div className="border border-[#FFFDF9]/10 rounded-xl overflow-hidden">
          <div className="px-6 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[#FFFDF9]/40 select-none pointer-events-none bg-[#0A0A0A]/20">
            <span>Intellectual Property</span>
          </div>
          <div className="px-6 py-4 text-[#FFFDF9]/60 font-body text-sm leading-relaxed">
            The Software and all associated intellectual property rights are owned by swiftClaw. The Software is protected by copyright laws and international treaty provisions.
          </div>
        </div>
        
        <div className="border border-[#FFFDF9]/10 rounded-xl overflow-hidden">
          <div className="px-6 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[#FFFDF9]/40 select-none pointer-events-none bg-[#0A0A0A]/20">
            <span>Disclaimer of Warranty</span>
          </div>
          <div className="px-6 py-4 text-[#FFFDF9]/60 font-body text-sm leading-relaxed">
            THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL swiftClaw BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY.
          </div>
        </div>
        
        <div className="border border-[#FFFDF9]/10 rounded-xl overflow-hidden">
          <div className="px-6 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[#FFFDF9]/40 select-none pointer-events-none bg-[#0A0A0A]/20">
            <span>Limitation of Liability</span>
          </div>
          <div className="px-6 py-4 text-[#FFFDF9]/60 font-body text-sm leading-relaxed">
            IN NO EVENT WILL swiftClaw BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF USE, DATA, GOOD-WILL, OR OTHER INTANGIBLE LOSSES.
          </div>
        </div>
        
        <div className="border border-[#FFFDF9]/10 rounded-xl overflow-hidden">
          <div className="px-6 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[#FFFDF9]/40 select-none pointer-events-none bg-[#0A0A0A]/20">
            <span>Governing Law</span>
          </div>
          <div className="px-6 py-4 text-[#FFFDF9]/60 font-body text-sm leading-relaxed">
            These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.
          </div>
        </div>
      </div>

      <blockquote className="border-l border-[#FFFDF9]/30 bg-[#FFFDF9]/[0.02] p-4 rounded-r-xl mt-8">
        <p className="font-body text-xs font-light italic leading-relaxed text-[#FFFDF9]/60">
          &quot;These terms are effective as of [Date] and are subject to change without notice. Continued use of the Software following any such changes constitutes your acceptance of the new terms.&quot;
        </p>
      </blockquote>
    </ScrollReveal>
  );
}
