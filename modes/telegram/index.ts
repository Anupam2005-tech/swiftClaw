import { Telegraf } from "telegraf";
import chalk from "chalk";
import { WELCOME } from "./constants";
import { registerHandler } from "./handlers";

export async function runTelegramMode() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const ownerId = process.env.TELEGRAM_OWNER_ID;

  const bot = new Telegraf(token!);

  registerHandler(bot);

  try {
    await bot.telegram.sendMessage(ownerId!, WELCOME, { parse_mode: "Markdown" });
    console.log(chalk.green("Telegram bot started on @swiftClawBot"));
  } catch (error: any) {
    console.error(chalk.red("Failed to send welcome message to owner."));
    console.error(chalk.red(error.message));
  }

  bot.catch((err: any) => {
    console.error(chalk.red("Telegram bot encountered an error:"));
    console.error(chalk.red(err?.message || err));
  });

  bot.launch().catch((error: any) => {
    console.error(chalk.red("Failed to launch Telegram bot."));
    console.error(chalk.red(error.message));
    process.exit(1);
  });
  console.log(chalk.green("Telegram bot is running. Press Ctrl+C to stop.\n"));
  await new Promise<void>((resolve) => {
    const stop = () => {
      bot.stop("SIGINT");
      resolve();
    };
    process.once("SIGINT", stop);
    process.once("SIGTERM", stop);
  });
}
