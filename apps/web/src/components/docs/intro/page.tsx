import { ScrollReveal } from "@/components/landing/scroll-reveal";
import {
  CopyBlock,
  DocBreadcrumb,
  DocCallout,
  DocHeader,
  DocSection,
  DocTable,
  StepList,
} from "@/components/docs/doc-chrome";
import { INSTALL, VERSION } from "@/lib/swiftclaw-docs";
import { Terminal } from "lucide-react";

export default function IntroPage() {
  return (
    <ScrollReveal className="space-y-12 selection:bg-[#FFFDF9] selection:text-black">
      <DocBreadcrumb section="Core" page="Introduction" />

  <DocHeader 
  title={
    <span className="flex items-center gap-3 font-normal">
      <Terminal className="h-8 w-8 text-accent" strokeWidth={1.5} />
      swiftClaw
    </span>
  }
>
  <p>
    swiftClaw is a local-first AI terminal companion, an to be alternative for OpenClaw. Run {" "}
     <strong className="text-[#FFFDF9] font-medium">swiftClaw</strong> to open an interactive menu: Agent mode edits
    your repo with zero-trust staging, Plan mode researches and drafts execution plans, Ask mode answers read-only
    questions, and Remote Gateway drives the same engine from Telegram.
  </p>
</DocHeader>

      <DocSection title="What you need">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-[#FFFDF9]/90">OpenRouter API key</strong> (required) — get one at{" "}
            <a href="https://openrouter.ai/keys" className="text-[#FFFDF9] underline" target="_blank" rel="noreferrer">
              openrouter.ai/keys
            </a>
          </li>
          <li>
            <strong className="text-[#FFFDF9]/90">Node 18+</strong> or <strong className="text-[#FFFDF9]/90">Bun</strong> if you install via npm/pnpm/bun (not needed for standalone binaries)
          </li>
          <li>Firecrawl and Telegram keys are optional (web search and Remote Gateway)</li>
        </ul>
      </DocSection>

      <DocSection title="Install (pick one)">
        <DocTable
          headers={["Method", "Best for", "Command"]}
          rows={[
            [
              "One-liner (macOS / Linux)",
              "Fastest global install, no Node required",
              <code key="c" className="font-mono text-[10px]">curl install.sh</code>,
            ],
            [
               "npm / pnpm / bun (local)",
              "Package managers, always latest from registry",
               <code key="n" className="font-mono text-[10px]">npm install swiftclaw</code>,
            ],
            [
              "Windows PowerShell",
              "Native .exe from GitHub Releases",
              <code key="w" className="font-mono text-[10px]">install.ps1</code>,
            ],
            [
              "Manual binary",
              "Air-gapped or custom PATH",
              "GitHub Releases assets",
            ],
            [
              "Docker",
              "Containerised, no install needed",
              "docker pull ghcr.io/anupam/swiftclaw",
            ],
          ]}
        />
        <CopyBlock command={INSTALL.curlOneLiner} label="macOS & Linux — recommended" />
        <CopyBlock command={INSTALL.npmGlobal} label="npm global" />
        <p className="text-[#FFFDF9]/40 text-xs">
          See <a href="/docs/install/cmd" className="text-[#FFFDF9] underline">Installation</a> for every platform and package manager.
        </p>
      </DocSection>

      <DocSection title="First run (onboarding)">
        <StepList
          steps={[
            {
              title: "Run the CLI",
              body: (
                <>
                  Type <code className="font-mono text-[#FFFDF9]">swiftclaw</code> or <code className="font-mono text-[#FFFDF9]">swiftClaw</code> in any directory after install.
                </>
              ),
            },
            {
              title: "Complete setup wizard",
              body: (
                <>
                  On first launch (or if your OpenRouter key is missing), swiftClaw prompts for your name and{" "}
                  <code className="font-mono text-[#FFFDF9]">OPENROUTER_API_KEY</code>. Optional keys for Firecrawl and Telegram can be skipped.
                  Config is saved to <code className="font-mono text-[#FFFDF9]">~/.swiftclaw/.env</code>.
                </>
              ),
            },
            {
              title: "Choose CLI Mode → Agent / Plan / Ask",
              body: (
                <>
                  Agent mode can read, write, and stage file changes with approval. Plan and Ask modes are read-only planners and Q&A.
                  If the API key is missing, you get a clear message instead of a stack trace.
                </>
              ),
            },
            {
              title: "Verify version",
              body: <CopyBlock command={INSTALL.verify} />,
            },
          ]}
        />
        <CopyBlock command={INSTALL.run} label="Start" />
      </DocSection>

      <DocCallout>
        <strong className="text-[#FFFDF9]">Troubleshooting:</strong> If you see{" "}
        <code className="font-mono">OpenRouter API key is missing</code>, run <code className="font-mono">swiftclaw</code> again to
        reopen setup, or edit <code className="font-mono">~/.swiftclaw/.env</code>. See{" "}
        <a href="/docs/config" className="text-[#FFFDF9] underline">Configuration</a>.
      </DocCallout>

      <p className="font-mono text-[10px] text-[#FFFDF9]/30 uppercase tracking-widest">Engine v{VERSION}</p>
    </ScrollReveal>
  );
}
