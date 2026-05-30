import * as p from "@clack/prompts";
import fs from "node:fs";
import {
  ENV_PATH,
  SWIFTCLAW_DIR,
  hasOpenRouterKey,
  loadSwiftClawEnv,
  writeEnvFile,
} from "./config.ts";

function isEmpty(value: string | symbol | undefined): value is undefined | "" {
  return value === undefined || value === "" || p.isCancel(value);
}

export async function runSetup(): Promise<boolean> {
  const envExists = fs.existsSync(ENV_PATH);
  if (envExists) loadSwiftClawEnv();

  if (envExists && hasOpenRouterKey()) {
    return false;
  }

  if (envExists) {
    p.log.warn("Configuration incomplete — OpenRouter API key is required.");
  } else {
    p.intro("Welcome to swiftClaw Setup 🦅");
  }

  const name = await p.text({
    message: "What should swiftClaw call you?",
    placeholder: "Your name",
    defaultValue: process.env.USER_NAME || undefined,
    validate: (value) => {
      if (!value?.trim()) return "Name is required";
    },
  });
  if (p.isCancel(name)) {
    p.cancel("Setup cancelled.");
    return false;
  }

  const openRouterKey = await p.password({
    message: "OpenRouter API key (required)",
    validate: (value) => {
      if (!value?.trim()) return "OpenRouter API key is required";
      if (!value.trim().startsWith("sk-")) return "Key should start with sk-";
    },
  });
  if (p.isCancel(openRouterKey)) {
    p.cancel("Setup cancelled.");
    return false;
  }

  const configureOptional = await p.confirm({
    message: "Add optional keys now? (Firecrawl for web search, Telegram for remote gateway)",
    initialValue: false,
  });
  if (p.isCancel(configureOptional)) {
    p.cancel("Setup cancelled.");
    return false;
  }

  let firecrawlKey = "";
  let telegramOwnerId = "";
  let telegramBotToken = "";

  if (configureOptional) {
    const fc = await p.text({
      message: "Firecrawl API key (optional — Plan/Ask web tools)",
      placeholder: "fc-... (Enter to skip)",
    });
    if (p.isCancel(fc)) {
      p.cancel("Setup cancelled.");
      return false;
    }
    firecrawlKey = typeof fc === "string" ? fc.trim() : "";

    const owner = await p.text({
      message: "Telegram owner user ID (optional)",
      placeholder: "123456789 (Enter to skip)",
    });
    if (p.isCancel(owner)) {
      p.cancel("Setup cancelled.");
      return false;
    }
    telegramOwnerId = typeof owner === "string" ? owner.trim() : "";

    const bot = await p.password({
      message: "Telegram bot token (optional)",
    });
    if (p.isCancel(bot)) {
      p.cancel("Setup cancelled.");
      return false;
    }
    telegramBotToken = typeof bot === "string" ? bot.trim() : "";
  }

  try {
    writeEnvFile({
      USER_NAME: String(name).trim(),
      OPENROUTER_API_KEY: String(openRouterKey).trim(),
      ...(firecrawlKey ? { FIRECRAWL_API_KEY: firecrawlKey } : {}),
      ...(telegramOwnerId ? { TELEGRAM_OWNER_ID: telegramOwnerId } : {}),
      ...(telegramBotToken ? { TELEGRAM_BOT_TOKEN: telegramBotToken } : {}),
    });
    p.outro("Setup complete. Run swiftclaw and choose a mode.");
    return true;
  } catch (error) {
    p.cancel("Failed to save configuration. Check permissions for ~/.swiftclaw");
    console.error(error);
    return false;
  }
}
