import React from "react";
import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { 
  Shield, 
  ArrowRight, 
  Lock,
  Zap,
  Mail
} from "lucide-react";

export default function PrivacyPage() {
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
        <ScrollReveal className="relative space-y-8 selection:bg-[#FF4500]/30 selection:text-[#FAF9F6] pt-12 pb-24">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-[#FAF9F6]/40 select-none pointer-events-none">
          <span className="hover:text-[#FFB400] transition-colors duration-300">Core</span>
          <ArrowRight className="h-3 w-3 opacity-30" />
          <span className="text-[#FAF9F6]/80 drop-shadow-[0_0_8px_rgba(250,249,246,0.3)]">Privacy Policy</span>
        </div>

        {/* Hero Heading */}
        <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-[#FAF9F6] mb-6">
          Privacy Policy
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF4500] to-[#FFB400]">.</span>
        </h1>

        {/* Policy Sections */}
        <div className="space-y-6 relative z-10">
          
          {/* Card 1: Information */}
          <div className="relative group rounded-xl overflow-hidden bg-black/80 backdrop-blur-sm border border-[#FAF9F6]/10 transition-all duration-500 hover:border-[#FF4500]/40 hover:shadow-[0_0_30px_-5px_rgba(255,69,0,0.15)] hover:-translate-y-0.5">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#FF4500] to-[#FFB400] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
            <div className="px-6 py-4 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[#FAF9F6]/40 select-none pointer-events-none bg-black/50 border-b border-[#FAF9F6]/10 group-hover:text-[#FFB400] transition-colors duration-300">
              <span>Information We Collect</span>
            </div>
            <div className="px-6 py-5 text-[#FAF9F6]/60 font-body text-sm leading-relaxed group-hover:text-[#FAF9F6]/90 transition-colors duration-300">
              swiftClaw is designed as a local-first, zero-trust terminal agent. We do not collect personal data, usage statistics, or telemetry from your machine. All processing occurs locally on your device.
            </div>
          </div>
           
          {/* Card 2: Data Processing */}
          <div className="relative group rounded-xl overflow-hidden bg-black/80 backdrop-blur-sm border border-[#FAF9F6]/10 transition-all duration-500 hover:border-[#FF4500]/40 hover:shadow-[0_0_30px_-5px_rgba(255,69,0,0.15)] hover:-translate-y-0.5">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#FF4500] to-[#FFB400] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
            <div className="px-6 py-4 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[#FAF9F6]/40 select-none pointer-events-none bg-black/50 border-b border-[#FAF9F6]/10 group-hover:text-[#FFB400] transition-colors duration-300">
              <Zap className="w-3.5 h-3.5" />
              <span>Data Processing</span>
            </div>
            <div className="px-6 py-5 text-[#FAF9F6]/60 font-body text-sm leading-relaxed group-hover:text-[#FAF9F6]/90 transition-colors duration-300">
              Any data processed by swiftClaw remains entirely on your local machine. The agent may interact with upstream AI models only via API keys that you provide and configure yourself. We do not store, transmit, or access these keys.
            </div>
          </div>
           
          {/* Card 3: Permissions */}
          <div className="relative group rounded-xl overflow-hidden bg-black/80 backdrop-blur-sm border border-[#FAF9F6]/10 transition-all duration-500 hover:border-[#FF4500]/40 hover:shadow-[0_0_30px_-5px_rgba(255,69,0,0.15)] hover:-translate-y-0.5">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#FF4500] to-[#FFB400] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
            <div className="px-6 py-4 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[#FAF9F6]/40 select-none pointer-events-none bg-black/50 border-b border-[#FAF9F6]/10 group-hover:text-[#FFB400] transition-colors duration-300">
              <Lock className="w-3.5 h-3.5" />
              <span>Permissions</span>
            </div>
            <div className="px-6 py-5 text-[#FAF9F6]/60 font-body text-sm leading-relaxed group-hover:text-[#FAF9F6]/90 transition-colors duration-300">
              swiftClaw requests only the filesystem permissions necessary to read your project structure and write to the designated staging area. We never request network, camera, microphone, or other unnecessary permissions.
            </div>
          </div>
           
          {/* Card 4: Security */}
          <div className="relative group rounded-xl overflow-hidden bg-black/80 backdrop-blur-sm border border-[#FAF9F6]/10 transition-all duration-500 hover:border-[#FF4500]/40 hover:shadow-[0_0_30px_-5px_rgba(255,69,0,0.15)] hover:-translate-y-0.5">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#FF4500] to-[#FFB400] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
            <div className="px-6 py-4 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[#FAF9F6]/40 select-none pointer-events-none bg-black/50 border-b border-[#FAF9F6]/10 group-hover:text-[#FFB400] transition-colors duration-300">
              <Shield className="w-3.5 h-3.5" />
              <span>Security</span>
            </div>
            <div className="px-6 py-5 text-[#FAF9F6]/60 font-body text-sm leading-relaxed group-hover:text-[#FAF9F6]/90 transition-colors duration-300">
              We implement industry-standard security measures to protect the software itself from tampering or reverse engineering. However, since swiftClaw runs locally, the security of your data and API keys is ultimately under your control.
            </div>
          </div>
           
          {/* Card 5: Changes */}
          <div className="relative group rounded-xl overflow-hidden bg-black/80 backdrop-blur-sm border border-[#FAF9F6]/10 transition-all duration-500 hover:border-[#FF4500]/40 hover:shadow-[0_0_30px_-5px_rgba(255,69,0,0.15)] hover:-translate-y-0.5">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#FF4500] to-[#FFB400] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
            <div className="px-6 py-4 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[#FAF9F6]/40 select-none pointer-events-none bg-black/50 border-b border-[#FAF9F6]/10 group-hover:text-[#FFB400] transition-colors duration-300">
              <span>Changes to This Policy</span>
            </div>
            <div className="px-6 py-5 text-[#FAF9F6]/60 font-body text-sm leading-relaxed group-hover:text-[#FAF9F6]/90 transition-colors duration-300">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
            </div>
          </div>
        </div>

        {/* Footer Blockquote */}
      <blockquote className="relative border-l-2 border-[#FF4500] bg-gradient-to-r from-[#FF4500]/10 to-transparent p-5 rounded-r-xl mt-12 flex items-start gap-4">
        <Mail className="w-5 h-5 text-[#FFB400] shrink-0 mt-0.5" />
        <p className="font-body text-sm font-light italic leading-relaxed text-[#FAF9F6]/70">
          &quot;If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@swiftclaw.online" className="text-[#FAF9F6] font-medium hover:text-[#FFB400] transition-colors underline decoration-[#FF4500]/50 underline-offset-4">privacy@swiftclaw.online</a>&quot;
        </p>
      </blockquote>
    </ScrollReveal>
  </div>
  </>
);
}