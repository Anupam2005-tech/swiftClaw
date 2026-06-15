import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { DocBreadcrumb, DocHeader, DocSection, DocTable, CopyBlock } from "@/components/docs/doc-chrome";
import { INSTALL } from "@/lib/swiftclaw-docs";

export default function CliPage() {
  return (
    <ScrollReveal className="space-y-12 selection:bg-[#FFFDF9] selection:text-black">
      <DocBreadcrumb section="Core" page="CLI Reference" />

      <DocHeader title="CLI reference">
        <p>
           The primary command is <code className="font-mono text-[#FFFDF9]">swiftclaw</code>. The binary and npm package register{" "}
           <code className="font-mono text-[#FFFDF9]">swiftClaw</code> as an alias. No subcommands are required — the TUI starts immediately.
        </p>
      </DocHeader>

      <DocSection title="Entry">
        <CopyBlock command={INSTALL.run} />
        <CopyBlock command={INSTALL.verify} label="Print version" />
      </DocSection>

      <DocSection title="Main menu">
        <DocTable
          headers={["Option", "Description"]}
          rows={[
            ["CLI Mode", "Local terminal: Agent, Plan, or Ask sub-modes"],
            ["Remote Gateway", "Telegram bot (requires TELEGRAM_BOT_TOKEN and TELEGRAM_OWNER_ID)"],
            ["Terminate Session", "Exit"],
          ]}
        />
      </DocSection>

      <DocSection title="CLI sub-modes">
        <DocTable
          headers={["Mode", "Writes files?", "Uses AI?"]}
          rows={[
            ["Agent Mode", "Yes (with approval staging)", "Yes — tools: read, write, search, shell, etc."],
            ["Plan Mode", "No (outputs plan markdown)", "Yes — research + structured plan"],
            ["Ask Mode", "No (read-only Q&A)", "Yes — codebase-aware answers"],
          ]}
        />
        <p>
          Agent, Plan, and Ask require a valid <code className="font-mono text-[#FFFDF9]">OPENROUTER_API_KEY</code>. If missing, swiftClaw
          prompts for setup or shows a friendly error — not an uncaught Node exception.
        </p>
      </DocSection>

      <DocSection title="Agent approval flow">
        <p>
          File changes are staged first. You review diffs, then approve or reject before anything is written to disk. This is the
          zero-trust staging model.
        </p>
      </DocSection>

      <DocSection title="Project skills">
        <p>
          Place skill files under <code className="font-mono text-[#FFFDF9]">.agent/skills/</code> in your repo. See{" "}
          <a href="/docs/skills" className="text-[#FFFDF9] underline">Agent Skills</a>.
        </p>
      </DocSection>
    </ScrollReveal>
  );
}
