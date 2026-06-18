import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { CopyBlock, DocBreadcrumb, DocHeader, DocSection, DocTable } from "@/components/docs/doc-chrome";
import { BINARIES, INSTALL, releaseAssetUrl } from "@/lib/swiftclaw-docs";

export default function MacInstallPage() {
  return (
    <ScrollReveal className="space-y-12 selection:bg-[#FFFDF9] selection:text-black">
      <DocBreadcrumb section="Deployment" page="macOS" />

      <DocHeader title="macOS">
        <p>
          Apple Silicon (arm64) and Intel (x64) are supported. Easiest path: the install script. Manual download is available from
          GitHub Releases.
        </p>
      </DocHeader>

      <DocSection title="Recommended — install script">
        <CopyBlock command={INSTALL.curlOneLiner} />
      </DocSection>

      <DocSection title="Manual binary">
        <DocTable
          headers={["Chip", "Asset", "Download"]}
          rows={[
            [
              "Apple Silicon (M1/M2/M3)",
              BINARIES.macos.arm64,
              <a key="a" href={releaseAssetUrl(BINARIES.macos.arm64)} className="text-[#FFFDF9] underline" target="_blank" rel="noreferrer">Download</a>,
            ],
            [
              "Intel",
              BINARIES.macos.x64,
              <a key="i" href={releaseAssetUrl(BINARIES.macos.x64)} className="text-[#FFFDF9] underline" target="_blank" rel="noreferrer">Download</a>,
            ],
          ]}
        />
        <p className="text-sm text-[#FFFDF9]/55">Then:</p>
        <CopyBlock command={`chmod +x swiftclaw-macos-arm64
mv swiftclaw-macos-arm64 ~/.local/bin/swiftClaw
ln -sf ~/.local/bin/swiftClaw ~/.local/bin/swiftclaw
export PATH="$PATH:$HOME/.local/bin"
swiftclaw`} />
      </DocSection>

      <DocSection title="npm / bun (alternative)">
        <CopyBlock command={INSTALL.npmGlobal} label="npm global" />
        <CopyBlock command={INSTALL.bunGlobal} label="bun global" />
      </DocSection>
    </ScrollReveal>
  );
}
