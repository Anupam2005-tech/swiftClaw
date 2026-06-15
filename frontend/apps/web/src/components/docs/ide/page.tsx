import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { DocBreadcrumb, DocCallout, DocHeader, DocSection } from "@/components/docs/doc-chrome";

export default function IdePage() {
  return (
    <ScrollReveal className="space-y-12 selection:bg-[#FFFDF9] selection:text-black">
      <DocBreadcrumb section="Core" page="IDE & editors" />

      <DocHeader title="IDE & editors">
        <p>
          swiftClaw is a <strong className="text-[#FFFDF9] font-medium">terminal-first</strong> agent. Run it in a terminal tab
          inside VS Code, Cursor, JetBrains, or any editor — point it at your project root and use Agent / Plan / Ask from there.
        </p>
      </DocHeader>

      <DocSection title="Recommended workflow">
        <ol className="list-decimal pl-5 space-y-2">
          <li>Open your repository in your editor.</li>
          <li>Open an integrated terminal at the project root.</li>
          <li>
            Run <code className="font-mono text-[#FFFDF9]">swiftclaw</code> → CLI Mode → Agent Mode.
          </li>
          <li>Approve staged file changes before they land on disk.</li>
        </ol>
      </DocSection>

      <DocSection title="Cursor / VS Code">
        <p>
          No separate extension is required today. Use the built-in terminal. For Cursor-specific agent rules, add project docs under{" "}
          <code className="font-mono text-[#FFFDF9]">.cursor/rules</code> or skills under{" "}
          <code className="font-mono text-[#FFFDF9]">.agent/skills</code> — swiftClaw can read those as project context when configured in your workflow.
        </p>
      </DocSection>

      <DocCallout>
        A dedicated VS Code / Cursor extension is on the roadmap (see Horizon in the docs sidebar). Until then, the CLI is the supported integration surface.
      </DocCallout>
    </ScrollReveal>
  );
}
