import {
  Output,
  extractJsonMiddleware,
  generateText,
  stepCountIs,
  tool,
  wrapLanguageModel,
  type Tool,
} from "ai";
import { z } from "zod";
import chalk from "chalk";
import { getAgentModel } from "../../ai/ai.config.ts";
import { ActionTracker } from "../agent/action-tracker.ts";
import { ToolExecutor } from "../agent/tool-executor.ts";
import { defaultAgentConfig } from "../agent/types.ts";
import type { Plan, PlanStep } from "./types.ts";
import { createWebTools } from "./web-tools.ts";
import { getPlanSystemPrompt, TOOL_DESCRIPTIONS } from "../prompts.ts";

const planSchema = z.object({
  researchSummary: z.string().optional(),
  steps: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
        hints: z.array(z.string()).optional(),
        complexity: z.enum(["low", "medium", "high"]).optional(),
      }),
    )
    .min(1)
    .max(15),
});

function readOnlyTools(
  executor: ToolExecutor,
  tracker?: import("../../utils/action-tracker").ActionTracker
) {
  return {
    read_file: tool({
      description: TOOL_DESCRIPTIONS.read_file,
      inputSchema: z.object({
        path: z.string().describe("Relative path to the file"),
      }),
      execute: async ({ path }) => {
        tracker?.update(`Calling read_file...`);
        try {
          return await executor.readFile(path);
        } finally {
          tracker?.update(`Finished read_file`);
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
        tracker?.update(`Calling list_files...`);
        try {
          return await executor.listDirectory(path, recursive);
        } finally {
          tracker?.update(`Finished list_files`);
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
        tracker?.update(`Calling search_files...`);
        try {
          return await executor.searchFiles(root, pattern, content_contains);
        } finally {
          tracker?.update(`Finished search_files`);
        }
      },
    }),
    list_skills: tool({
      description: TOOL_DESCRIPTIONS.list_skills,
      inputSchema: z.object({}),
      execute: async () => {
        tracker?.update(`Calling list_skills...`);
        try {
          return await executor.listSkills();
        } finally {
          tracker?.update(`Finished list_skills`);
        }
      },
    }),

    read_skill_docs: tool({
      description: TOOL_DESCRIPTIONS.read_skill_docs,
      inputSchema: z.object({
        path: z.string().describe("Absolute path to a SKILL.md file (from list_skills)"),
      }),
      execute: async ({ path }) => {
        tracker?.update(`Calling read_skill_docs...`);
        try {
          return await executor.readSkill(path);
        } finally {
          tracker?.update(`Finished read_skill_docs`);
        }
      },
    }),

    analyze_codebase: tool({
      description: TOOL_DESCRIPTIONS.analyze_codebase,
      inputSchema: z.object({
        path: z.string().default(".").describe("Relative path, defaults to project root"),
      }),
      execute: async ({ path }) => {
        tracker?.update(`Calling analyze_codebase...`);
        try {
          return await executor.analyzeCodebase(path);
        } finally {
          tracker?.update(`Finished analyze_codebase`);
        }
      },
    }),
  };
}

// todo web scroll
export async function generatePlan(goal: string) {
  const config = defaultAgentConfig();
  const tracker = new ActionTracker();
  const executor = new ToolExecutor(tracker, config);
  
  const { CliActionTracker } = await import("../../utils/action-tracker.ts");
  const uiTracker = new CliActionTracker();

  const hasweb = !!process.env.FIRECRAWL_API_KEY;
  const model = wrapLanguageModel({
    model: getAgentModel(),
    middleware: extractJsonMiddleware(),
  });

  // todo: add web search tools
  const tools = {
    ...readOnlyTools(executor, uiTracker),
    ...(hasweb ? createWebTools(tracker, uiTracker) : {}),
  };
  
  uiTracker.start("Researching & drafting a plan...");

  const result = await generateText({
    model,
    tools,
    stopWhen: stepCountIs(20),
    system: getPlanSystemPrompt(config.codebasePath, hasweb),
    prompt: `User goal: \n${goal}`,
    output: Output.object({ schema: planSchema }),
    onStepFinish: ({ toolCalls }) => {
      for (const toolCall of toolCalls) {
        if (!toolCall) continue;
        const preview = JSON.stringify(toolCall.input).slice(0, 200);
        const { log } = require("@clack/prompts");
        log.step(
          `${chalk.green("✓")} ${chalk.bold(String(toolCall.toolName))} ${chalk.dim(preview + (preview.length >= 200 ? "..." : ""))}`
        );
      }
      uiTracker.update("Refining plan...");
    },
  });
  
  uiTracker.stop("Finished drafting plan.");

  const validated = planSchema.parse(result.output);
  const steps: PlanStep[] = validated.steps.map((s, i) => ({
    id: `step-${i + 1}`,
    title: s.title,
    description: s.description,
    hints: s.hints,
    complexity: s.complexity,
  }));
  return { goal, researchSummary: validated.researchSummary, steps };
}
