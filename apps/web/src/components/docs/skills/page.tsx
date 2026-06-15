import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { DocBreadcrumb, DocHeader, DocSection, CopyBlock } from "@/components/docs/doc-chrome";

export default function SkillsPage() {
  return (
    <ScrollReveal className="space-y-12 selection:bg-[#FFFDF9] selection:text-black">
      <DocBreadcrumb section="Core" page="Agent Skills" />

      <DocHeader title="Agent skills">
        <p>
          Skills are markdown instruction files that teach the agent domain-specific workflows (deploy, review, OpenSpec, etc.). Place
          them in your repository so Agent mode can follow your team&apos;s conventions.
        </p>
      </DocHeader>

      <DocSection title="Location">
        <p>Project skills directory:</p>
        <CopyBlock command=".agent/skills/<skill-name>/SKILL.md" />
        <p>
          Each skill is a folder with a <code className="font-mono text-[#FFFDF9]">SKILL.md</code> file. The agent discovers skills relative to your current working directory.
        </p>
      </DocSection>

      <DocSection title="Example layout">
        <CopyBlock
          command={`.agent/skills/
  deploy/SKILL.md
  code-review/SKILL.md
  openspec-apply/SKILL.md`}
        />
      </DocSection>

      <DocSection title="Authoring tips">
        <ul className="list-disc pl-5 space-y-2">
          <li>State when the skill applies and step-by-step procedures.</li>
          <li>Reference real paths and commands used in this repo.</li>
          <li>Keep skills focused — one workflow per skill.</li>
        </ul>
      </DocSection>
    </ScrollReveal>
  );
}
