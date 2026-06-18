import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { CopyBlock, DocBreadcrumb, DocHeader, DocSection } from "@/components/docs/doc-chrome";
import { INSTALL } from "@/lib/swiftclaw-docs";

export default function DockerInstallPage() {
  return (
    <ScrollReveal className="space-y-12 selection:bg-[#FFFDF9] selection:text-black">
      <DocBreadcrumb section="Deployment" page="Docker" />

      <DocHeader title="Docker">
        <p>
          Run swiftClaw in a container via the official image on GitHub Container Registry.
          No Node.js or binary installation needed.
        </p>
      </DocHeader>

      <DocSection title="Pull and run">
        <CopyBlock command={INSTALL.dockerPull} label="Pull" />
        <CopyBlock command={INSTALL.dockerRun} label="Run" />
      </DocSection>

      <DocSection title="Version pinning">
        <p>
          Tagged images follow releases. Replace <code className="font-mono text-[#FFFDF9]">latest</code> with a specific version:
        </p>
        <CopyBlock command="docker pull ghcr.io/anupam/swiftclaw:v1.0.1" label="Specific version" />
      </DocSection>

      <DocSection title="Mount config (optional)">
        <p>
          Persist your setup across container restarts by mounting <code className="font-mono text-[#FFFDF9]">~/.swiftclaw</code>:
        </p>
        <CopyBlock
          command="docker run --rm -it -v ~/.swiftclaw:/root/.swiftclaw ghcr.io/anupam/swiftclaw:latest"
          label="With config mount"
        />
      </DocSection>
    </ScrollReveal>
  );
}
