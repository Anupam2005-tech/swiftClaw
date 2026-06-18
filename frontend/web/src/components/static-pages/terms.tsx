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
    <>
      {/* PREMIUM BACKGROUND 
        Pitch black base with a subtle cream-white (#FAF9F6) grid.
        Uses a radial gradient mask to fade the grid out beautifully at the edges.
      */}
      <div className="fixed inset-0 -z-10 bg-black">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#FAF9F608_1px,transparent_1px),linear-gradient(to_bottom,#FAF9F608_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_30%,#000_40%,transparent_100%)]"></div>
      </div>

      <div className="relative w-full min-h-screen bg-[#000000] text-[#FFFDF9] overflow-hidden isolate py-32 px-4 sm:px-6 lg:px-8 pt-[60px]">
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
<div className="border border-[#FFFDF9]/10 rounded-xl overflow-hidden group transition-all duration-300 hover:border-[#FFFDF9]/30 hover:bg-[#FFFDF9]/[0.02] hover:shadow-[0_0_20px_rgba(255,253,249,0.05)]">
           <div className="px-6 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[#FFFDF9]/40 select-none pointer-events-none bg-[#FFFDF9]/[0.03] group-hover:text-[#FFFDF9]/70 transition-colors duration-300">
             <span>Acceptance of Terms</span>
           </div>
           <div className="px-6 py-4 text-[#FFFDF9]/60 font-body text-sm leading-relaxed group-hover:text-[#FFFDF9]/80 transition-colors duration-300">
             By accessing or using swiftClaw, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, you may not use the Software.
           </div>
         </div>
         
         <div className="border border-[#FFFDF9]/10 rounded-xl overflow-hidden group transition-all duration-300 hover:border-[#FFFDF9]/30 hover:bg-[#FFFDF9]/[0.02] hover:shadow-[0_0_20px_rgba(255,253,249,0.05)]">
           <div className="px-6 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[#FFFDF9]/40 select-none pointer-events-none bg-[#FFFDF9]/[0.03] group-hover:text-[#FFFDF9]/70 transition-colors duration-300">
             <span>License Grant</span>
           </div>
           <div className="px-6 py-4 text-[#FFFDF9]/60 font-body text-sm leading-relaxed group-hover:text-[#FFFDF9]/80 transition-colors duration-300">
             Subject to your compliance with these Terms, swiftClaw grants you a limited, non-exclusive, non-transferable, revocable license to install and use the Software solely for your personal, non-commercial or internal business purposes.
           </div>
         </div>
         
         <div className="border border-[#FFFDF9]/10 rounded-xl overflow-hidden group transition-all duration-300 hover:border-[#FFFDF9]/30 hover:bg-[#FFFDF9]/[0.02] hover:shadow-[0_0_20px_rgba(255,253,249,0.05)]">
           <div className="px-6 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[#FFFDF9]/40 select-none pointer-events-none bg-[#FFFDF9]/[0.03] group-hover:text-[#FFFDF9]/70 transition-colors duration-300">
             <span>User Obligations</span>
           </div>
           <div className="px-6 py-4 text-[#FFFDF9]/60 font-body text-sm leading-relaxed group-hover:text-[#FFFDF9]/80 transition-colors duration-300">
             You agree to use the Software only for lawful purposes and in accordance with these Terms. You are responsible for maintaining the confidentiality of your account and API keys, and for all activities that occur under your account.
           </div>
         </div>
         
         <div className="border border-[#FFFDF9]/10 rounded-xl overflow-hidden group transition-all duration-300 hover:border-[#FFFDF9]/30 hover:bg-[#FFFDF9]/[0.02] hover:shadow-[0_0_20px_rgba(255,253,249,0.05)]">
           <div className="px-6 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[#FFFDF9]/40 select-none pointer-events-none bg-[#FFFDF9]/[0.03] group-hover:text-[#FFFDF9]/70 transition-colors duration-300">
             <span>Intellectual Property</span>
           </div>
           <div className="px-6 py-4 text-[#FFFDF9]/60 font-body text-sm leading-relaxed group-hover:text-[#FFFDF9]/80 transition-colors duration-300">
             The Software and all associated intellectual property rights are owned by swiftClaw. The Software is protected by copyright laws and international treaty provisions.
           </div>
         </div>
         
         <div className="border border-[#FFFDF9]/10 rounded-xl overflow-hidden group transition-all duration-300 hover:border-[#FFFDF9]/30 hover:bg-[#FFFDF9]/[0.02] hover:shadow-[0_0_20px_rgba(255,253,249,0.05)]">
           <div className="px-6 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[#FFFDF9]/40 select-none pointer-events-none bg-[#FFFDF9]/[0.03] group-hover:text-[#FFFDF9]/70 transition-colors duration-300">
             <span>Disclaimer of Warranty</span>
           </div>
           <div className="px-6 py-4 text-[#FFFDF9]/60 font-body text-sm leading-relaxed group-hover:text-[#FFFDF9]/80 transition-colors duration-300">
             THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL swiftClaw BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY.
           </div>
         </div>
         
         <div className="border border-[#FFFDF9]/10 rounded-xl overflow-hidden group transition-all duration-300 hover:border-[#FFFDF9]/30 hover:bg-[#FFFDF9]/[0.02] hover:shadow-[0_0_20px_rgba(255,253,249,0.05)]">
           <div className="px-6 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[#FFFDF9]/40 select-none pointer-events-none bg-[#FFFDF9]/[0.03] group-hover:text-[#FFFDF9]/70 transition-colors duration-300">
             <span>Limitation of Liability</span>
           </div>
           <div className="px-6 py-4 text-[#FFFDF9]/60 font-body text-sm leading-relaxed group-hover:text-[#FFFDF9]/80 transition-colors duration-300">
             IN NO EVENT WILL swiftClaw BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF USE, DATA, GOOD-WILL, OR OTHER INTANGIBLE LOSSES.
           </div>
         </div>
         
         <div className="border border-[#FFFDF9]/10 rounded-xl overflow-hidden group transition-all duration-300 hover:border-[#FFFDF9]/30 hover:bg-[#FFFDF9]/[0.02] hover:shadow-[0_0_20px_rgba(255,253,249,0.05)]">
           <div className="px-6 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[#FFFDF9]/40 select-none pointer-events-none bg-[#FFFDF9]/[0.03] group-hover:text-[#FFFDF9]/70 transition-colors duration-300">
             <span>Governing Law</span>
           </div>
           <div className="px-6 py-4 text-[#FFFDF9]/60 font-body text-sm leading-relaxed group-hover:text-[#FFFDF9]/80 transition-colors duration-300">
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
  </div>
  </>
);
}
