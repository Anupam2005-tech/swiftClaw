import chalk from "chalk";
import { confirm, select, isCancel, text } from "@clack/prompts";
import { ToolLoopAgent, stepCountIs, tool } from "ai";
import z from "zod";
import { getAgentModel } from "../../ai/ai.config";
import { ActionTracker } from "../agent/action-tracker";
import { ToolExecutor } from "../agent/tool-executor";
import { defaultAgentConfig } from "../agent/types";
import { renderTerminalMarkdown } from "../../tui/termina-md";
import { runApprovalFlow } from "../agent/approvals";
import { createWebTools } from "../plan/web-tools";
import { getAskSystemPrompt, TOOL_DESCRIPTIONS } from "../prompts";

function createAskTools(
  executor: ToolExecutor,
  uiTracker?: import("../../utils/action-tracker").ActionTracker,
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


function asMd(question: string, answer: string): string {
  return `# Ask Mode

## Question

${question.trim()}

## Answer

${answer.trim()}`;
}

export async function runAskMode() {
  console.log(chalk.bold("\n Ask Mode\n "));

  const questions = await text({ message: "What do you want to ask?" });
  if (isCancel(questions) || !questions.trim()) return;

  const config = defaultAgentConfig();
  config.tools.allowFileCreation = true;
  config.tools.allowFileModification = false;
  config.tools.allowFolderCreation = false;
  config.tools.allowShellExecution = false;

  const actionTracker = new ActionTracker();
  const executor = new ToolExecutor(actionTracker, config);

  const { CliActionTracker } = await import("../../utils/action-tracker");
  const uiTracker = new CliActionTracker();

  //   web search
  const hasweb = !!process.env.FIRECRAWL_API_KEY;

  const tools = {
    ...createAskTools(executor, uiTracker),
    ...(hasweb ? createWebTools(actionTracker, uiTracker) : {}),
  };

  uiTracker.start("Agent is thinking...");

  const agent = new ToolLoopAgent({
    model: getAgentModel(),
    stopWhen: stepCountIs(20),
    instructions: getAskSystemPrompt(config.codebasePath),
    tools,
  });

  try {
    const result = await agent.generate({
      prompt: questions.trim(),
      onStepFinish: ({ toolCalls }) => {
        if (toolCalls.length > 0) {
          uiTracker.stop("Executed tools.");
          for (const toolCall of toolCalls) {
            if (!toolCall) continue;
            const preview = JSON.stringify(toolCall.input).slice(0, 200);
            const { log } = require("@clack/prompts");
            log.step(
              `${chalk.green("✓")} ${chalk.bold(String(toolCall.toolName))} ${chalk.dim(preview + (preview.length >= 200 ? "..." : ""))}`
            );
          }
          uiTracker.start("Refining response...");
        } else {
          uiTracker.update("Refining response...");
        }
      },
    });
    
    uiTracker.stop("Finished thinking.");
    const answer = result.text?.trim() || "(no answer)";
    console.log(`\n +${renderTerminalMarkdown(answer)} + \n`);

    const wantsSave = await confirm({
      message: "Do you want to save this to a .md file?",
      initialValue: false,
    });
    if (isCancel(wantsSave) || !wantsSave) return;

    const filename = await text({
      message: "Filename",
      initialValue: "ask.md",
      validate: (v) => {
        const s = (v ?? " ").trim();
        if (!s) return "Required";
        if (s.includes(" ..") || s.includes("/") || s.includes("\\"))
          return " No paths";
        if (!s.toLowerCase().endsWith(".md")) return " Must end with .md";
      },
    });

    if(isCancel(filename))return

    executor.createFile(filename,asMd(questions,answer))
    const ok =await runApprovalFlow(actionTracker)
    if(!ok)return executor.clearStaging()

    executor.applyApprovedFromTracker()
    executor.clearStaging()
  } catch (error: any) {
    uiTracker.stop("Failed to generate response.");
    const { log } = require("@clack/prompts");
    log.error(chalk.red(`AI generation failed: ${error.message || error}`));
    if (error.message?.includes("429") || error.name === "RetryError" || error.name === "AI_APICallError") {
       log.warn(chalk.yellow("Rate limit hit or API error. Consider adding your own OPENROUTER_API_KEY in the environment."));
    }
  }

}
