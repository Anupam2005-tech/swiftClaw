import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { CopyBlock, DocBreadcrumb, DocCallout, DocHeader, DocSection, StepList } from "@/components/docs/doc-chrome";
import { INSTALL } from "@/lib/swiftclaw-docs";

export default function TelegramPage() {
  return (
    <ScrollReveal className="space-y-12 selection:bg-[#FFFDF9] selection:text-black">
      <DocBreadcrumb section="Core" page="Telegram Gateway" />

      <DocHeader title="Remote Gateway (Telegram)">
        <p>
          Control swiftClaw from Telegram. Requires a bot token from @BotFather and your Telegram user ID for access control. OpenRouter
          is still required for AI responses.
        </p>
      </DocHeader>

      <DocSection title="Setup">
        <StepList
          steps={[
            {
              title: "Create a bot",
              body: "Message @BotFather on Telegram, run /newbot, save the bot token.",
            },
            {
              title: "Get your user ID",
              body: "Use @userinfobot or similar to find your numeric Telegram user ID.",
            },
            {
              title: "Add to ~/.swiftclaw/.env",
              body: (
                <CopyBlock
                  command={`TELEGRAM_BOT_TOKEN=123456:ABC...
TELEGRAM_OWNER_ID=123456789
OPENROUTER_API_KEY=sk-or-v1-...`}
                />
              ),
            },
            {
              title: "Start gateway",
              body: (
                <>
                  Run <code className="font-mono text-[#FFFDF9]">swiftclaw</code> → Remote Gateway. Or re-run setup and choose optional Telegram keys.
                </>
              ),
            },
          ]}
        />
        <CopyBlock command={INSTALL.run} label="Launch CLI" />
      </DocSection>

      <DocCallout>
        Only the owner ID configured in <code className="font-mono">TELEGRAM_OWNER_ID</code> should be able to drive the bot. Keep your bot token secret.
      </DocCallout>
    </ScrollReveal>
  );
}
