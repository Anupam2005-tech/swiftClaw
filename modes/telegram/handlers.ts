import { Telegraf } from "telegraf";
import { isOwner } from "./auth";
import { WELCOME } from "./constants";
import { commandArg, replyMd } from "./text";
import { runAsk, runAgent, runPlanSteps, telegramSessions, pendingPlans } from "./agent-run.ts";
import { generatePlan } from "../plan/planner.ts";
import { registerPlanSessionHandlers } from "./plan-session.ts";
import { registerReviewSessionHandlers } from "./review-session.ts";

export function registerHandler(bot: Telegraf) {
  bot.command("start", async (ctx) => {
    if (!isOwner(ctx.chat.id)) return;
    await ctx.reply(WELCOME, { parse_mode: "Markdown" });
  });

  bot.command("ask", async (ctx) => {
    if (!isOwner(ctx.chat.id)) return;
    const prompt = commandArg(ctx.message.text, "ask");
    if (!prompt) return ctx.reply("Usage: /ask <your question>", { parse_mode: "Markdown" });
    await ctx.reply(`*Thinking...*`, { parse_mode: "Markdown" });

    void runAsk(ctx, prompt).catch((error: any) => {
      console.error(error);
      ctx.reply("Sorry, an error occurred during ask mode.");
    });
  });

  bot.command("agent", async (ctx) => {
    if (!isOwner(ctx.chat.id)) return;
    const prompt = commandArg(ctx.message.text, "agent");
    if (!prompt) return ctx.reply("Usage: /agent <goal/task description>", { parse_mode: "Markdown" });
    await ctx.reply(`*Agent starting execution...*`, { parse_mode: "Markdown" });

    void runAgent(ctx, ctx.chat.id, prompt).catch((error: any) => {
      console.error(error);
      ctx.reply("Sorry, an error occurred during agent execution.");
    });
  });

  bot.command("plan", async (ctx) => {
    if (!isOwner(ctx.chat.id)) return;
    const prompt = commandArg(ctx.message.text, "plan");
    if (!prompt) return ctx.reply("Usage: /plan <your goal>", { parse_mode: "Markdown" });
    await ctx.reply(`*Researching and drafting plan...*`, { parse_mode: "Markdown" });

    try {
      const plan = await generatePlan(prompt);
      let responseText = `*Goal:* ${plan.goal}\n\n`;
      if (plan.researchSummary) {
        responseText += `*Research Summary:*\n${plan.researchSummary}\n\n`;
      }
      responseText += `*Proposed Steps:*\n`;
      plan.steps.forEach((step, idx) => {
        responseText += `${idx + 1}. *${step.title}* (${step.complexity || 'medium'} complexity)\n   ${step.description}\n`;
      });
      responseText += `\nWould you like to execute this plan?`;

      pendingPlans.set(ctx.chat.id, plan);

      await ctx.reply(responseText, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              { text: "✅ Run Plan", callback_data: `tg_run_plan_${ctx.chat.id}` },
              { text: "❌ Cancel", callback_data: `tg_cancel_plan_${ctx.chat.id}` }
            ]
          ]
        }
      });
    } catch (error) {
      console.error(error);
      ctx.reply("Sorry, an error occurred while generating the plan.");
    }
  });

  registerPlanSessionHandlers(bot);
  registerReviewSessionHandlers(bot);

  bot.action(/tg_approve_(\d+)/, async (ctx) => {
    const matchStr = ctx.match?.[1];
    if (!matchStr) return;
    const chatId = parseInt(matchStr, 10);
    if (!isOwner(chatId)) return;

    await ctx.answerCbQuery().catch(() => {});

    const session = telegramSessions.get(chatId);
    if (!session) {
      await ctx.reply("No active session found for approval.");
      return;
    }

    await ctx.editMessageReplyMarkup({ inline_keyboard: [] }).catch(() => {});
    await ctx.reply("*Applying approved changes...*", { parse_mode: "Markdown" });

    try {
      const errors = session.executor.applyApprovedFromTracker();
      if (errors.length) {
        let errMsg = "❌ *Some operations reported errors:*\n\n";
        for (const e of errors) {
          errMsg += `- ${e}\n`;
        }
        await replyMd(ctx, errMsg);
      } else {
        await ctx.reply("✅ Changes applied successfully!");
      }
    } catch (err: any) {
      console.error(err);
      await ctx.reply(`Error applying changes: ${err.message || err}`);
    } finally {
      session.executor.clearStaging();
      telegramSessions.delete(chatId);
    }
  });

  bot.action(/tg_reject_(\d+)/, async (ctx) => {
    const matchStr = ctx.match?.[1];
    if (!matchStr) return;
    const chatId = parseInt(matchStr, 10);
    if (!isOwner(chatId)) return;

    await ctx.answerCbQuery().catch(() => {});

    const session = telegramSessions.get(chatId);
    if (!session) {
      await ctx.reply("No active session found.");
      return;
    }

    await ctx.editMessageReplyMarkup({ inline_keyboard: [] }).catch(() => {});
    session.executor.clearStaging();
    telegramSessions.delete(chatId);

    await ctx.reply("❌ Changes rejected and staging cleared.");
  });
}