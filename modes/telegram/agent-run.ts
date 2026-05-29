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
  onStatus?: (status: string) => void,
) {
  return {
    read_file: tool({
      description: TOOL_DESCRIPTIONS.read_file,
      inputSchema: z.object({
        path: z.string().describe("Relative path to the file"),
      }),
      execute: async ({ path }) => {
        onStatus?.(`Reading file: ${path}`);
        return executor.readFile(path);
      },
    }),

    list_files: tool({
      description: TOOL_DESCRIPTIONS.list_files,
      inputSchema: z.object({
        path: z.string().describe("Relative path to the folder"),
        recursive: z.boolean().optional().default(false),
      }),
      execute: async ({ path, recursive }) => {
        onStatus?.(`Listing files in: ${path}`);
        return executor.listDirectory(path, recursive);
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
        onStatus?.(`Searching files in ${root} for ${pattern}`);
        return executor.searchFiles(root, pattern, content_contains);
      },
    }),
    list_skills: tool({
      description: TOOL_DESCRIPTIONS.list_skills,
      inputSchema: z.object({}),
      execute: async () => {
        onStatus?.("Listing available skills");
        return executor.listSkills();
      },
    }),

    read_skill_docs: tool({
      description: TOOL_DESCRIPTIONS.read_skill_docs,
      inputSchema: z.object({
        path: z.string().describe("Absolute path to a SKILL.md file (from list_skills)"),
      }),
      execute: async ({ path }) => {
        onStatus?.(`Reading skill docs: ${path}`);
        return executor.readSkill(path);
      },
    }),

    analyze_codebase: tool({
      description: TOOL_DESCRIPTIONS.analyze_codebase,
      inputSchema: z.object({
        path: z.string().default(".").describe("Relative path, defaults to project root"),
      }),
      execute: async ({ path }) => {
        onStatus?.(`Analyzing codebase at: ${path}`);
        return executor.analyzeCodebase(path);
      },
    }),
  };
}

function extraWebTools (tracker: ActionTracker) {
return process.env.FIRECRAWL_API_KEY? createWebTools (tracker) : {};
}

export async function runAsk(ctx: { reply: (t: string, o?: object) => Promise<unknown> }, question: string) {
  const config = readOnlyConfig();
  const tracker = new ActionTracker();
  const executor = new ToolExecutor(tracker, config);
  const tools = { ...createReadOnlyTools(executor), ...extraWebTools(tracker) };
  const agent = new ToolLoopAgent({
    ...agentoptions(config, 20, getTelegramAskPrompt(config.codebasePath)),
    tools,
  });

  const { text } = await agent.generate({ prompt: question });
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

export async function runAgent(ctx: { reply: (t: string, o?: object) => Promise<unknown> }, chatId: number, goal: string) {
  const config = defaultAgentConfig();
  const tracker = new ActionTracker();
  const executor = new ToolExecutor(tracker, config);
  const tools = createAgentTools(executor);
  const agent = new ToolLoopAgent({
    ...agentoptions(config, 40, getTelegramAgentPrompt(config.codebasePath)),
    tools,
  });
  const { text } = await agent.generate({ prompt: goal });
  if (text?.trim()) await replyMd(ctx, text.trim());
  await finishOrApprove(ctx, chatId, tracker, executor, '✔ Done. No file changes were needed.');
}

export async function runPlanSteps(ctx: { reply: (t: string, o?: object) => Promise<unknown> }, chatId: number, plan: Plan) {
  const config = defaultAgentConfig();
  const tracker = new ActionTracker();
  const executor = new ToolExecutor(tracker, config);
  const tools = { ...createAgentTools(executor), ...extraWebTools(tracker) };

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

    const result = await agent.generate({ messages });
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