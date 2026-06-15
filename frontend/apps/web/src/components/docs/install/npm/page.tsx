import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { CopyBlock, DocBreadcrumb, DocHeader, DocSection, DocTable } from "@/components/docs/doc-chrome";
import { INSTALL } from "@/lib/swiftclaw-docs";

export default function NpmInstallPage() {
  return (
    <ScrollReveal className="space-y-12 selection:bg-[#FFFDF9] selection:text-black">
      <DocBreadcrumb section="Deployment" page="npm / pnpm / bun" />

       <DocHeader title="Package managers">
         <p>
           Install the published <code className="font-mono text-[#FFFDF9]">swiftclaw</code> npm package. Requires Node.js 18+.
           For the best experience, install it locally to your project.
         </p>
       </DocHeader>

       <DocSection title="Local Project Installation (Recommended)">
         <CopyBlock command={INSTALL.npmLocal} label="npm" />
         <CopyBlock command={INSTALL.pnpmLocal} label="pnpm" />
         <CopyBlock command={INSTALL.bunLocal} label="bun" />
         <p className="mt-4">Run the locally installed binary:</p>
         <CopyBlock command={INSTALL.npx} label="npm" />
         <CopyBlock command={INSTALL.pnpmExec} label="pnpm" />
         <CopyBlock command={INSTALL.bunx} label="bun" />
       </DocSection>

       <DocSection title="Global Installation (Alternative)">
         <CopyBlock command={INSTALL.npmGlobal} label="npm" />
         <CopyBlock command={INSTALL.pnpmGlobal} label="pnpm" />
         <CopyBlock command={INSTALL.bunGlobal} label="bun" />
         <p>Then run <code className="font-mono text-[#FFFDF9]">swiftclaw</code> from any directory.</p>
       </DocSection>

      <DocSection title="Use swiftclaw as the only command (local)">
        <p>Add the project&apos;s <code className="font-mono text-[#FFFDF9]">node_modules/.bin</code> to PATH:</p>
        <CopyBlock command={INSTALL.pathLocalBin} />
        <p>Then run <code className="font-mono text-[#FFFDF9]">swiftclaw</code> from that project directory.</p>
      </DocSection>

      <DocSection title="Verify">
        <CopyBlock command={INSTALL.verify} />
      </DocSection>
    </ScrollReveal>
  );
}
