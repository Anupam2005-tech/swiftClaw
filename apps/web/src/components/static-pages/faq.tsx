import React from "react";
import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { 
  HelpCircle, 
  ArrowRight, 
  Zap, 
  Shield, 
  Terminal, 
  Code,
  Settings2,
  Cpu
} from "lucide-react";

export default function FAQPage() {
  const faqs = [
    {
      question: "What makes swiftClaw different from other terminal agents?",
      answer: "swiftClaw is designed with a zero-trust architecture where every filesystem mutation is compiled inside an isolated virtual staging area. Your live production directories remain completely untouched until you physically authenticate the payload, ensuring no accidental overwrites or unauthorized changes."
    },
    {
      question: "How does the staging mechanism work in swiftClaw?",
      answer: "swiftClaw operates in a dual-mode system: Plan Mode maps complex structural architectures across microservices, while Ask Mode executes structural, completely read-only system queries. Changes are never applied to your live system without explicit human confirmation through our clearance protocol."
    },
    {
      question: "Is my data secure when using swiftClaw?",
      answer: "Yes. swiftClaw operates purely within local workspace runtimes. It maps context schemas locally and contacts upstream inference engines exclusively via user-provided keys. No telemetry is collected, and all processing happens on your machine."
    },
    {
      question: "What programming languages and frameworks does swiftClaw support?",
      answer: "swiftClaw is language-agnostic and works with any codebase. It understands project structures through AST parsing and works with JavaScript/TypeScript, Python, Go, Rust, Java, C/C++, and more. The agent adapts to your specific tech stack through contextual awareness."
    },
    {
      question: "How does the Telegram Gateway integration work?",
      answer: "The Telegram Gateway allows for secure remote monitoring and manual approval of staged changes. You generate a gateway token via CLI, link your Telegram ID through a secure bot handshake, and then receive detailed diffs in your Telegram chat for interactive approval workflows."
    },
    {
      question: "Can I create custom skills for swiftClaw?",
      answer: "Absolutely. Skills are modular capabilities that extend the agent's cognitive reach. You can define your own skills using simple YAML definitions or TypeScript scripts to teach the agent how to interact with internal APIs or proprietary tools specific to your organization."
    },
    {
      question: "What are the system requirements for running swiftClaw?",
      answer: "swiftClaw requires Node.js 18+ or Bun 1.0+ for the CLI, and runs on Windows, macOS, and Linux. For the full experience, we recommend 8GB RAM minimum and a modern multi-core processor. The sandboxed runtime is designed to be lightweight and efficient.",
      },
    {
      question: "How do I contribute to the swiftClaw project?",
      answer: "We welcome contributions! Check out our GitHub repository for contribution guidelines. You can contribute through code improvements, documentation, skill development, or community support. All contributions go through our standard pull request review process."
    }
  ];

  return (
    <ScrollReveal className="space-y-8 selection:bg-[#FFFDF9] selection:text-black">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-[#FFFDF9]/40 select-none pointer-events-none">
        <span>Core</span>
        <ArrowRight className="h-3 w-3 opacity-30" />
        <span className="text-[#FFFDF9]/80">Frequently Asked Questions</span>
      </div>

      <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-[#FFFDF9] mb-6">
        Common Questions.
      </h1>

      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <div key={index} className="border border-[#FFFDF9]/10 rounded-xl overflow-hidden group">
            <div className="flex items-center justify-between px-6 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[#FFFDF9]/40 select-none pointer-events-none bg-[#0A0A0A]/20">
              <span>{faq.question}</span>
              <HelpCircle className="h-4 w-4 text-[#FFFDF9]/60 group-hover:text-[#FFFDF9] transition-colors duration-300" />
            </div>
            <div className="px-6 py-4 text-[#FFFDF9]/60 font-body text-sm leading-relaxed">
              {faq.answer}
            </div>
          </div>
        ))}
      </div>

      <blockquote className="border-l border-[#FFFDF9]/30 bg-[#FFFDF9]/[0.02] p-4 rounded-r-xl mt-8">
        <p className="font-body text-xs font-light italic leading-relaxed text-[#FFFDF9]/60">
          &quot;Still have questions? Reach out to our community on GitHub Discussions or join our Telegram channel for real-time support from the swiftClaw team and fellow developers.&quot;
        </p>
      </blockquote>
    </ScrollReveal>
  );
}
