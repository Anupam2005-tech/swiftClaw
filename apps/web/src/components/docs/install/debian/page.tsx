import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { CopyBlock, DocBreadcrumb, DocCallout, DocHeader, DocSection, DocTable } from "@/components/docs/doc-chrome";
import { BINARIES, INSTALL, releaseAssetUrl } from "@/lib/swiftclaw-docs";

export default function LinuxInstallPage() {
  return (
    <ScrollReveal className="space-y-12 selection:bg-[#FFFDF9] selection:text-black">
      <DocBreadcrumb section="Deployment" page="Linux" />

      <DocHeader title="Linux (Debian, Ubuntu, Fedora, Arch, …)">
        <p>
          swiftClaw does not ship an APT repository yet. Use the install script or download a release binary directly. There is no
          <code className="font-mono text-[#FFFDF9]"> apt install swiftclaw</code> package at this time.
        </p>
      </DocHeader>

      <DocSection title="Recommended — install script">
        <CopyBlock command={INSTALL.curlOneLiner} />
      </DocSection>

      <DocSection title="Manual binary">
        <DocTable
          headers={["Architecture", "Asset"]}
          rows={[
            ["x86_64 / amd64", BINARIES.linux.x64],
            ["arm64 / aarch64", BINARIES.linux.arm64],
          ]}
        />
        <CopyBlock command={`curl -L -o swiftclaw ${releaseAssetUrl("swiftclaw-linux-x64")}
chmod +x swiftclaw
mkdir -p ~/.local/bin
mv swiftclaw ~/.local/bin/swiftClaw
ln -sf ~/.local/bin/swiftClaw ~/.local/bin/swiftclaw
echo 'export PATH="$PATH:$HOME/.local/bin"' >> ~/.bashrc
source ~/.bashrc
swiftclaw`} />
      </DocSection>

      <DocSection title="Package managers (Node required)">
        <CopyBlock command={INSTALL.npmGlobal} label="npm" />
        <CopyBlock command={INSTALL.pnpmGlobal} label="pnpm" />
        <CopyBlock command={INSTALL.bunGlobal} label="bun" />
      </DocSection>

      <DocCallout>
        On Debian/Ubuntu you may need <code className="font-mono">curl</code>: <code className="font-mono">sudo apt install curl</code>
      </DocCallout>
    </ScrollReveal>
  );
}
