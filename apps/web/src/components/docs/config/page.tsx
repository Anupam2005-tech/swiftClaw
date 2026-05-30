import { ScrollReveal } from "@/components/landing/scroll-reveal";
import {
  CopyBlock,
  DocBreadcrumb,
  DocCallout,
  DocHeader,
  DocSection,
  DocTable,
} from "@/components/docs/doc-chrome";
import { CONFIG_DIR, ENV_FILE, ENV_VARS, INSTALL } from "@/lib/swiftclaw-docs";

export default function ConfigPage() {
  return (
    <ScrollReveal className="space-y-12 selection:bg-[#FFFDF9] selection:text-black">
      <DocBreadcrumb section="Core" page="Configuration" />

      <DocHeader title="Configuration">
        <p>
          swiftClaw stores secrets in <code className="font-mono text-[#FFFDF9]">{ENV_FILE}</code>. The setup wizard creates this
          file on first run. Environment variables can also be exported in your shell, but the file is the recommended approach.
        </p>
      </DocHeader>

      <DocSection title="Re-run setup">
        <p>
          Delete or fix a missing <code className="font-mono text-[#FFFDF9]">OPENROUTER_API_KEY</code>, then run:
        </p>
        <CopyBlock command={INSTALL.run} />
        <p>The wizard runs again when the OpenRouter key is absent or empty.</p>
      </DocSection>

      <DocSection title="Environment variables">
        <DocTable
          headers={["Variable", "Required", "Purpose"]}
          rows={ENV_VARS.map((v) => [
            <code key={v.name} className="font-mono text-[#FFFDF9] text-[11px]">
              {v.name}
            </code>,
            v.required ? "Yes" : "No",
            <>
              {v.description}
              <br />
              <span className="font-mono text-[10px] text-[#FFFDF9]/35">e.g. {v.example}</span>
            </>,
          ])}
        />
      </DocSection>

      <DocSection title="Example .env">
        <CopyBlock
          label="~/.swiftclaw/.env"
          command={`USER_NAME=YourName
OPENROUTER_API_KEY=sk-or-v1-...
# Optional:
# FIRECRAWL_API_KEY=fc-...
# TELEGRAM_OWNER_ID=123456789
# TELEGRAM_BOT_TOKEN=123456:ABC...
# OPENROUTER_DEFAULT_MODEL=google/gemini-2.5-pro`}
        />
      </DocSection>

      <DocCallout>
        Config directory: <code className="font-mono">{CONFIG_DIR}</code>. Never commit API keys to git. Agent mode only touches
        files inside your current working directory unless you approve staged changes.
      </DocCallout>
    </ScrollReveal>
  );
}
