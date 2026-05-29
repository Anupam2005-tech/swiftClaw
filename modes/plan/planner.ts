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

// todo web scroll
export async function generatePlan(goal: string) {
  const config = defaultAgentConfig();
  const tracker = new ActionTracker();
  const executor = new ToolExecutor(tracker, config);

  const hasweb = !!process.env.FIRECRAWL_API_KEY;
  const model = wrapLanguageModel({
    model: getAgentModel(),
    middleware: extractJsonMiddleware(),
  });

  // todo: add web search tools
  const tools = {
    ...readOnlyTools(executor),
    ...(hasweb ? createWebTools(tracker) : {}),
  };
  console.log(chalk.cyan("\n Researching & drafting a plan...\n"));

  const result = await generateText({
    model,
    tools,
    stopWhen: stepCountIs(20),
    system: getPlanSystemPrompt(config.codebasePath, hasweb),
    prompt: `User goal: \n${goal}`,
    output: Output.object({ schema: planSchema }),
  });

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
