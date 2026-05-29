import { Telegraf } from "telegraf";
import { isOwner } from "./auth";
import { telegramSessions } from "./agent-run.ts";
import { groupPending } from "../agent/approvals.ts";

export function registerReviewSessionHandlers(bot: Telegraf) {
  bot.action(/tg_review_one_(\d+)/, async (ctx) => {
    const matchStr = ctx.match?.[1];
    if (!matchStr) return;
    const chatId = parseInt(matchStr, 10);
    if (!isOwner(chatId)) return;

    await ctx.answerCbQuery().catch(() => {});
    await ctx.editMessageReplyMarkup({ inline_keyboard: [] }).catch(() => {});

    const session = telegramSessions.get(chatId);
    if (!session) {
      await ctx.reply("No active session found.");
      return;
    }

    session.groups = groupPending(session.tracker.getPendingMutations());
    session.currentIndex = 0;

    await sendNextReviewItem(ctx, chatId);
  });

  bot.action(/tg_approve_group_(\d+)/, async (ctx) => {
    await handleGroupAction(ctx, "approve");
  });

  bot.action(/tg_reject_group_(\d+)/, async (ctx) => {
    await handleGroupAction(ctx, "reject");
  });

  bot.action(/tg_abort_review_(\d+)/, async (ctx) => {
    const matchStr = ctx.match?.[1];
    if (!matchStr) return;
    const chatId = parseInt(matchStr, 10);
    if (!isOwner(chatId)) return;

    await ctx.answerCbQuery().catch(() => {});
    await ctx.editMessageReplyMarkup({ inline_keyboard: [] }).catch(() => {});

    const session = telegramSessions.get(chatId);
    if (!session || !session.groups || session.currentIndex === undefined) return;

    // Reject remaining
    for (let j = session.currentIndex; j < session.groups.length; j++) {
      for (const id of session.groups[j]!.actionId) {
        session.tracker.updateStatus(id, "rejected", false);
      }
    }

    await finishReview(ctx, chatId, session);
  });
}

async function handleGroupAction(ctx: any, action: "approve" | "reject") {
  const matchStr = ctx.match?.[1];
  if (!matchStr) return;
  const chatId = parseInt(matchStr, 10);
  if (!isOwner(chatId)) return;

  await ctx.answerCbQuery().catch(() => {});
  await ctx.editMessageReplyMarkup({ inline_keyboard: [] }).catch(() => {});

  const session = telegramSessions.get(chatId);
  if (!session || !session.groups || session.currentIndex === undefined) return;

  const currentGroup = session.groups[session.currentIndex];
  if (currentGroup) {
    for (const id of currentGroup.actionId) {
      session.tracker.updateStatus(id, action === "approve" ? "approved" : "rejected", action === "approve");
    }
  }

  session.currentIndex++;
  await sendNextReviewItem(ctx, chatId);
}

async function sendNextReviewItem(ctx: any, chatId: number) {
  const session = telegramSessions.get(chatId);
  if (!session || !session.groups || session.currentIndex === undefined) return;

  if (session.currentIndex >= session.groups.length) {
    await finishReview(ctx, chatId, session);
    return;
  }

  const g = session.groups[session.currentIndex];
  let msg = `*Reviewing Change ${session.currentIndex + 1} of ${session.groups.length}*\n\n`;
  msg += `*${g!.label}*\n`;
  if (g!.patch) {
    const patchSnippet = g!.patch.length > 3000 ? g!.patch.substring(0, 3000) + "\n... (truncated)" : g!.patch;
    msg += `\`\`\`diff\n${patchSnippet}\n\`\`\`\n`;
  }

  await ctx.reply(msg, {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [
          { text: "✅ Approve", callback_data: `tg_approve_group_${chatId}` },
          { text: "❌ Reject", callback_data: `tg_reject_group_${chatId}` }
        ],
        [
          { text: "🛑 Abort Review", callback_data: `tg_abort_review_${chatId}` }
        ]
      ]
    }
  });
}

async function finishReview(ctx: any, chatId: number, session: any) {
  const errors = session.executor.applyApprovedFromTracker();
  telegramSessions.delete(chatId);

  if (errors.length > 0) {
    await ctx.reply(`Review completed, but some changes failed to apply:\n\n${errors.join("\n")}`);
  } else {
    // Check if anything was actually approved
    const approved = session.tracker.getApprovedActions();
    if (approved.length > 0) {
      await ctx.reply(`✔ Review completed. Applied ${approved.length} approved actions successfully.`);
    } else {
      await ctx.reply(`✔ Review completed. No changes were applied.`);
    }
  }
}
