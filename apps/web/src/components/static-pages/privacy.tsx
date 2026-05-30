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
    <ScrollReveal className="space-y-8 selection:bg-[#FFFDF9] selection:text-black">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-[#FFFDF9]/40 select-none pointer-events-none">
        <span>Core</span>
        <ArrowRight className="h-3 w-3 opacity-30" />
        <span className="text-[#FFFDF9]/80">Privacy Policy</span>
      </div>

      <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-[#FFFDF9] mb-6">
        Privacy Policy.
      </h1>

      <div className="space-y-6">
        <div className="border border-[#FFFDF9]/10 rounded-xl overflow-hidden">
          <div className="px-6 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[#FFFDF9]/40 select-none pointer-events-none bg-[#0A0A0A]/20">
            <span>Information We Collect</span>
          </div>
          <div className="px-6 py-4 text-[#FFFDF9]/60 font-body text-sm leading-relaxed">
            swiftClaw is designed as a local-first, zero-trust terminal agent. We do not collect personal data, usage statistics, or telemetry from your machine. All processing occurs locally on your device.
          </div>
        </div>
        
        <div className="border border-[#FFFDF9]/10 rounded-xl overflow-hidden">
          <div className="px-6 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[#FFFDF9]/40 select-none pointer-events-none bg-[#0A0A0A]/20">
            <span>Data Processing</span>
          </div>
          <div className="px-6 py-4 text-[#FFFDF9]/60 font-body text-sm leading-relaxed">
            Any data processed by swiftClaw remains entirely on your local machine. The agent may interact with upstream AI models only via API keys that you provide and configure yourself. We do not store, transmit, or access these keys.
          </div>
        </div>
        
        <div className="border border-[#FFFDF9]/10 rounded-xl overflow-hidden">
          <div className="px-6 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[#FFFDF9]/40 select-none pointer-events-none bg-[#0A0A0A]/20">
            <span>Permissions</span>
          </div>
          <div className="px-6 py-4 text-[#FFFDF9]/60 font-body text-sm leading-relaxed">
            swiftClaw requests only the filesystem permissions necessary to read your project structure and write to the designated staging area. We never request network, camera, microphone, or other unnecessary permissions.
          </div>
        </div>
        
        <div className="border border-[#FFFDF9]/10 rounded-xl overflow-hidden">
          <div className="px-6 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[#FFFDF9]/40 select-none pointer-events-none bg-[#0A0A0A]/20">
            <span>Security</span>
          </div>
          <div className="px-6 py-4 text-[#FFFDF9]/60 font-body text-sm leading-relaxed">
            We implement industry-standard security measures to protect the software itself from tampering or reverse engineering. However, since swiftClaw runs locally, the security of your data and API keys is ultimately under your control.
          </div>
        </div>
        
        <div className="border border-[#FFFDF9]/10 rounded-xl overflow-hidden">
          <div className="px-6 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[#FFFDF9]/40 select-none pointer-events-none bg-[#0A0A0A]/20">
            <span>Changes to This Policy</span>
          </div>
          <div className="px-6 py-4 text-[#FFFDF9]/60 font-body text-sm leading-relaxed">
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
          </div>
        </div>
      </div>

      <blockquote className="border-l border-[#FFFDF9]/30 bg-[#FFFDF9]/[0.02] p-4 rounded-r-xl mt-8">
        <p className="font-body text-xs font-light italic leading-relaxed text-[#FFFDF9]/60">
          &quot;If you have any questions about this Privacy Policy, please contact us at privacy@swiftclaw.online&quot;
        </p>
      </blockquote>
    </ScrollReveal>
  );
}
