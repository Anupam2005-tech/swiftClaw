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

  //   web search
  const hasweb = !!process.env.FIRECRAWL_API_KEY;

  const tools = {
    ...createAskTools(executor),
    ...(hasweb ? createWebTools(actionTracker) : {}),
  };

  const agent = new ToolLoopAgent({
    model: getAgentModel(),
    stopWhen: stepCountIs(20),
    instructions: getAskSystemPrompt(config.codebasePath),
    tools,
  });

  const result = await agent.generate({
    prompt: questions.trim(),
  });
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

}
