import { Telegraf } from "telegraf";
import { isOwner } from "./auth";
import { runPlanSteps, pendingPlans } from "./agent-run.ts";

export function registerPlanSessionHandlers(bot: Telegraf) {
  bot.action(/tg_run_plan_(\d+)/, async (ctx) => {
    const matchStr = ctx.match?.[1];
    if (!matchStr) return;
    const chatId = parseInt(matchStr, 10);
    if (!isOwner(chatId)) return;

    await ctx.answerCbQuery().catch(() => {});

    const plan = pendingPlans.get(chatId);
    if (!plan) {
      await ctx.reply("No pending plan found to run.");
      return;
    }

    pendingPlans.delete(chatId);

    // Edit message to remove inline buttons
    await ctx.editMessageReplyMarkup({ inline_keyboard: [] }).catch(() => {});

    void runPlanSteps(ctx, chatId, plan).catch((error: any) => {
      console.error(error);
      ctx.reply("Sorry, an error occurred during plan execution.");
    });
  });

  bot.action(/tg_cancel_plan_(\d+)/, async (ctx) => {
    const matchStr = ctx.match?.[1];
    if (!matchStr) return;
    const chatId = parseInt(matchStr, 10);
    if (!isOwner(chatId)) return;

    await ctx.answerCbQuery().catch(() => {});
    pendingPlans.delete(chatId);

    await ctx.editMessageReplyMarkup({ inline_keyboard: [] }).catch(() => {});
    await ctx.reply("Plan execution cancelled.");
  });
}
