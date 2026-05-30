import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { CopyBlock, DocBreadcrumb, DocCallout, DocHeader, DocSection } from "@/components/docs/doc-chrome";
import { BINARIES, INSTALL, INSTALL_PS1_URL, releaseAssetUrl } from "@/lib/swiftclaw-docs";

export default function WindowsInstallPage() {
  return (
    <ScrollReveal className="space-y-12 selection:bg-[#FFFDF9] selection:text-black">
      <DocBreadcrumb section="Deployment" page="Windows" />

      <DocHeader title="Windows">
        <p>
          Use PowerShell to install the standalone <code className="font-mono text-[#FFFDF9]">swiftClaw.exe</code> (x64). Node.js is
          not required for the binary path. npm global install also works if you have Node 18+.
        </p>
      </DocHeader>

      <DocSection title="Recommended — PowerShell installer">
        <CopyBlock command={INSTALL.powershellOneLiner} label="PowerShell (run as your user)" />
        <p>Installs to <code className="font-mono text-[#FFFDF9]">%LOCALAPPDATA%\Programs\swiftclaw</code> and adds it to your user PATH.</p>
      </DocSection>

      <DocSection title="Manual download">
        <p>
          Asset: <code className="font-mono text-[#FFFDF9]">{BINARIES.windows.x64}</code> —{" "}
          <a href={releaseAssetUrl(BINARIES.windows.x64)} className="text-[#FFFDF9] underline" target="_blank" rel="noreferrer">
            GitHub Releases
          </a>
        </p>
        <p>Place the exe on your PATH or run from its folder. Commands: <code className="font-mono">swiftClaw</code> or <code className="font-mono">swiftclaw</code>.</p>
      </DocSection>

      <DocSection title="npm global (alternative)">
        <CopyBlock command={INSTALL.npmGlobal} />
        <CopyBlock command={INSTALL.run} label="Run after install" />
      </DocSection>

      <DocCallout>
        Script source:{" "}
        <a href={INSTALL_PS1_URL} className="text-[#FFFDF9] underline" target="_blank" rel="noreferrer">
          install.ps1
        </a>
        . Restart the terminal after install so PATH updates apply.
      </DocCallout>
    </ScrollReveal>
  );
}
