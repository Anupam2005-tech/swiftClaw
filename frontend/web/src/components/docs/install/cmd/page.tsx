import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { CopyBlock, DocBreadcrumb, DocCallout, DocHeader, DocSection, StepList } from "@/components/docs/doc-chrome";
import { BIN_DIR, DOMAIN, GITHUB_URL, INSTALL, INSTALL_SH_URL } from "@/lib/swiftclaw-docs";

export default function CmdInstallPage() {
  return (
    <ScrollReveal className="space-y-12 selection:bg-[#FFFDF9] selection:text-black">
      <DocBreadcrumb section="Deployment" page="CMD / One-Liner" />

      <DocHeader title="macOS & Linux one-liner">
        <p>
          Downloads the latest standalone binary from GitHub Releases — no Node.js required. Installs to{" "}
          <code className="font-mono text-[#FFFDF9]">{BIN_DIR}</code> and creates both <code className="font-mono">swiftClaw</code> and{" "}
          <code className="font-mono">swiftclaw</code> commands.
        </p>
      </DocHeader>

      <CopyBlock command={INSTALL.curlOneLiner} label="Install" />

      <DocSection title="What the script does">
        <StepList
          steps={[
            { title: "Detect OS", body: "macOS or Linux, and CPU architecture (x64 or arm64)." },
            { title: "Download binary", body: `Asset name pattern: swiftclaw-macos-arm64, swiftclaw-linux-x64, etc.` },
            { title: "Install to ~/.local/bin", body: "Executable swiftClaw plus symlink swiftclaw." },
            { title: "PATH hint", body: "If ~/.local/bin is not on PATH, the script tells you to add export PATH=\"$PATH:$HOME/.local/bin\"." },
            { title: "First run", body: <>Run <code className="font-mono text-[#FFFDF9]">swiftclaw</code> — setup wizard collects your OpenRouter key.</> },
          ]}
        />
      </DocSection>

      <DocCallout>
        Review the script before piping to bash:{" "}
        <a href={INSTALL_SH_URL} className="text-[#FFFDF9] underline" target="_blank" rel="noreferrer">
          install.sh
        </a>
        . Source:{" "}
        <a href={GITHUB_URL} className="text-[#FFFDF9] underline" target="_blank" rel="noreferrer">{DOMAIN}</a>{" / "}
        <a href={GITHUB_URL} className="text-[#FFFDF9] underline" target="_blank" rel="noreferrer">GitHub</a>
      </DocCallout>
    </ScrollReveal>
  );
}
