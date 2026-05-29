import { tool, ToolLoopAgent, stepCountIs } from "ai";
import { z } from "zod";
import { getAgentModel } from "../../ai/ai.config.ts";
import { ActionTracker } from "../agent/action-tracker.ts";
import { ToolExecutor } from "../agent/tool-executor.ts";
import { createAgentTools } from "../agent/agent-tools.ts";
import { defaultAgentConfig, type AgentConfig } from "../agent/types.ts";
import { createWebTools } from "../plan/web-tools.ts";
import type { Plan, PlanStep } from "../plan/types.ts";
import { replyMd } from "./text.ts";
import { groupPending } from "../agent/approvals.ts";
import {
  getTelegramAgentPrompt,
  getTelegramAskPrompt,
  getTelegramPlanStepPrompt,
  TOOL_DESCRIPTIONS,
} from "../prompts.ts";

function readOnlyConfig(): AgentConfig {
  const c = defaultAgentConfig();
  c.tools.allowFileCreation = false;
  c.tools.allowFileModification = false;
  c.tools.allowFolderCreation = false;
  c.tools.allowShellExecution = false;
  return c;
}

function agentoptions(config: AgentConfig, maxSteps: number, instructions: string) {
  return {
    model: getAgentModel(),
    stopWhen: stepCountIs(maxSteps),
    instructions,
  };
}


function createReadOnlyTools(
  executor: ToolExecutor,
  uiTracker?: import("../../utils/action-tracker.ts").ActionTracker,
) {
  return {
    read_file: tool({
      description: TOOL_DESCRIPTIONS.read_file,
      inputSchema: z.object({
        path: z.string().describe("Relative path to the file"),
      }),
      execute: async ({ path }) => {
        uiTracker?.update(`Reading file: ${path}`);
        try {
          return await executor.readFile(path);
        } finally {
          uiTracker?.update(`Finished reading file: ${path}`);
        }
      },
    }),

    list_files: tool({
      description: TOOL_DESCRIPTIONS.list_files,
      inputSchema: z.object({
        path: z.string().describe("Relative path to the folder"),
        recursive: z.boolean().optional().default(false),
      }),
      execute: async ({ path, recursive }) => {
        uiTracker?.update(`Listing files in: ${path}`);
        try {
          return await executor.listDirectory(path, recursive);
        } finally {
          uiTracker?.update(`Finished listing files`);
        }
      },
    }),
    search_files: tool({
      description: TOOL_DESCRIPTIONS.search_files,
      inputSchema: z.object({
        root: z.string().describe("Directory to search, relative to project root"),
        pattern: z
          .string()
          .describe("Glob pattern (e.g., '*.ts', '**/*.md')"),
        content_contains: z.string().optional().describe("Optional substring to filter file contents"),
      }),
      execute: async ({ root, pattern, content_contains }) => {
        uiTracker?.update(`Searching files in ${root} for ${pattern}`);
        try {
          return await executor.searchFiles(root, pattern, content_contains);
        } finally {
          uiTracker?.update(`Finished search files`);
        }
      },
    }),
    list_skills: tool({
      description: TOOL_DESCRIPTIONS.list_skills,
      inputSchema: z.object({}),
      execute: async () => {
        uiTracker?.update("Listing available skills");
        try {
          return await executor.listSkills();
        } finally {
          uiTracker?.update(`Finished listing skills`);
        }
      },
    }),

    read_skill_docs: tool({
      description: TOOL_DESCRIPTIONS.read_skill_docs,
      inputSchema: z.object({
        path: z.string().describe("Absolute path to a SKILL.md file (from list_skills)"),
      }),
      execute: async ({ path }) => {
        uiTracker?.update(`Reading skill docs: ${path}`);
        try {
          return await executor.readSkill(path);
        } finally {
          uiTracker?.update(`Finished reading skill docs`);
        }
      },
    }),

    analyze_codebase: tool({
      description: TOOL_DESCRIPTIONS.analyze_codebase,
      inputSchema: z.object({
        path: z.string().default(".").describe("Relative path, defaults to project root"),
      }),
      execute: async ({ path }) => {
        uiTracker?.update(`Analyzing codebase at: ${path}`);
        try {
          return await executor.analyzeCodebase(path);
        } finally {
          uiTracker?.update(`Finished analyzing codebase`);
        }
      },
    }),
  };
}

function extraWebTools(tracker: ActionTracker, uiTracker?: import("../../utils/action-tracker.ts").ActionTracker) {
  return process.env.FIRECRAWL_API_KEY ? createWebTools(tracker, uiTracker) : {};
}

export async function runAsk(ctx: import("telegraf").Context, question: string) {
  const config = readOnlyConfig();
  const tracker = new ActionTracker();
  const executor = new ToolExecutor(tracker, config);
  
  const { TelegramActionTracker } = await import("../../utils/action-tracker.ts");
  const uiTracker = new TelegramActionTracker(ctx);
  
  const tools = { ...createReadOnlyTools(executor, uiTracker), ...extraWebTools(tracker, uiTracker) };
  
  uiTracker.start("Agent is thinking...");
  
  const agent = new ToolLoopAgent({
    ...agentoptions(config, 20, getTelegramAskPrompt(config.codebasePath)),
    tools,
  });

  const { text } = await agent.generate({ 
    prompt: question,
    onStepFinish: ({ toolCalls }) => {
      uiTracker.update("Refining response...");
    }
  });
  
  uiTracker.stop("Finished thinking.");
  await replyMd(ctx, text || "no answer");
}

export interface TelegramSession {
  tracker: ActionTracker;
  executor: ToolExecutor;
  groups?: ReturnType<typeof groupPending>;
  currentIndex?: number;
}

export const telegramSessions = new Map<number, TelegramSession>();
export const pendingPlans = new Map<number, Plan>();

export async function finishOrApprove(
  ctx: { reply: (t: string, o?: object) => Promise<unknown> },
  chatId: number,
  tracker: ActionTracker,
  executor: ToolExecutor,
  defaultMessage: string,
) {
  const pending = tracker.getPendingMutations();
  if (pending.length === 0) {
    await replyMd(ctx, defaultMessage);
    return;
  }

  const groups = groupPending(pending);
  let summary = "*Pending changes ready for review:*\n\n";
  for (let i = 0; i < groups.length; i++) {
    const g = groups[i]!;
    summary += `*Group ${i + 1}/${groups.length}:* ${g.label}\n`;
    if (g.patch) {
      const patchSnippet = g.patch.length > 500 ? g.patch.substring(0, 500) + "\n... (truncated)" : g.patch;
      summary += `\`\`\`diff\n${patchSnippet}\n\`\`\`\n`;
    }
  }
  summary += "\nDo you want to approve and apply these changes?";

  telegramSessions.set(chatId, { tracker, executor });

  await ctx.reply(summary, {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [
          { text: "✅ Approve All", callback_data: `tg_approve_${chatId}` },
          { text: "❌ Reject All", callback_data: `tg_reject_${chatId}` }
        ],
        [
          { text: "🔍 Review One by One", callback_data: `tg_review_one_${chatId}` }
        ]
      ]
    }
  });
}

export async function runAgent(ctx: import("telegraf").Context, chatId: number, goal: string) {
  const config = defaultAgentConfig();
  const tracker = new ActionTracker();
  const executor = new ToolExecutor(tracker, config);
  const { TelegramActionTracker } = await import("../../utils/action-tracker.ts");
  const uiTracker = new TelegramActionTracker(ctx);
  const tools = createAgentTools(executor, uiTracker);
  
  uiTracker.start("Agent is thinking...");
  const agent = new ToolLoopAgent({
    ...agentoptions(config, 40, getTelegramAgentPrompt(config.codebasePath)),
    tools,
  });
  const { text } = await agent.generate({ 
    prompt: goal,
    onStepFinish: () => {
      uiTracker.update("Refining response...");
    }
  });
  uiTracker.stop("Finished thinking.");
  if (text?.trim()) await replyMd(ctx, text.trim());
  await finishOrApprove(ctx, chatId, tracker, executor, '✔ Done. No file changes were needed.');
}

export async function runPlanSteps(ctx: import("telegraf").Context, chatId: number, plan: Plan) {
  const config = defaultAgentConfig();
  const tracker = new ActionTracker();
  const executor = new ToolExecutor(tracker, config);
  const { TelegramActionTracker } = await import("../../utils/action-tracker.ts");
  const uiTracker = new TelegramActionTracker(ctx);
  const tools = { ...createAgentTools(executor, uiTracker), ...extraWebTools(tracker, uiTracker) };

  await ctx.reply(`*Starting plan execution...*`, { parse_mode: "Markdown" });

  const agent = new ToolLoopAgent({
    ...agentoptions(config, 30, getTelegramAgentPrompt(config.codebasePath)),
    tools,
  });

  const messages: any[] = [
    { role: "user", content: `Goal: ${plan.goal}` }
  ];

  for (let i = 0; i < plan.steps.length; i++) {
    const step = plan.steps[i];
    if (!step) continue;

    // Update agent instructions for this specific step
    (agent as any).options = {
      ...(agent as any).options,
      instructions: getTelegramPlanStepPrompt(
        config.codebasePath,
        plan.goal,
        i + 1,
        plan.steps.length,
        step.title,
      ),
    };
    await ctx.reply(`*Executing Step ${i + 1}/${plan.steps.length}:* ${step.title}\n_${step.description}_`, { parse_mode: "Markdown" });
    
    messages.push({
      role: "user",
      content: `Step: ${step.title}\n${step.description}`
    });

    uiTracker.start("Agent is thinking...");
    const result = await agent.generate({ 
      messages,
      onStepFinish: () => {
        uiTracker.update("Refining response...");
      }
    });
    uiTracker.stop("Finished step.");
    const { text, response } = result;

    if (text?.trim()) {
      await replyMd(ctx, text.trim());
    }

    if (response?.messages) {
      messages.push(...response.messages);
    } else if (text) {
      messages.push({ role: "assistant", content: text });
    }
  }
  await finishOrApprove(ctx, chatId, tracker, executor, '✔ Done. Plan executed successfully.');
}