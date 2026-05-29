import { isCancel, text, spinner, log } from "@clack/prompts";
import chalk from "chalk";
import { defaultAgentConfig } from "./types";
import { ActionTracker } from "./action-tracker";
import { ToolExecutor } from "./tool-executor";
import { createAgentTools } from "./agent-tools";
import { stepCountIs, ToolLoopAgent } from "ai";
import { getAgentMode } from "../../ai";
import { renderTerminalMarkdown } from "../../tui/termina-md";
import { runApprovalFlow } from "./approvals";
import { getAgentSystemPrompt } from "../prompts";

export async function runAgentmode() {
  console.log(chalk.bold("\n Agent Mode\n"));

  const goal = await text({
    message: "What would you like the agent to do?",
    placeholder: "Concrete task from codebase",
  });
  if (isCancel(goal) || !goal.trim()) return;

  const config = defaultAgentConfig();
  const tracker = new ActionTracker();
  const executor = new ToolExecutor(tracker, config);
  const s = spinner();
  const tools = createAgentTools(executor, (status) => s.message(status));

  const agent = new ToolLoopAgent({
    model: getAgentMode(),
    stopWhen: stepCountIs(40),
    instructions: getAgentSystemPrompt(config.codebasePath),
    tools,
  });

  s.start("Agent is thinking...");

  const result = await agent.generate({
    prompt: goal?.trim(),
    onStepFinish: ({ toolCalls }) => {
      for (const toolCall of toolCalls) {
        const preview = JSON.stringify(toolCall.input).slice(0, 200);
        log.step(
          `${chalk.green("✓")} ${chalk.bold(String(toolCall.toolName))} ${chalk.dim(preview + (preview.length >= 200 ? "..." : ""))}`
        );
      }
      s.message("Refining response...");
    },
  });

  s.stop("Finished thinking.");
  if (result.text?.trim()) console.log(renderTerminalMarkdown(result.text));

  const ok = await runApprovalFlow(tracker);
  if (!ok) return executor.clearStaging();

  const errors = executor.applyApprovedFromTracker();
  if (errors.length) {
    console.log(chalk.red("\n Some operations reported errors...\n"));
    for (const e of errors) {
      console.log(chalk.red(` ${e}`));
    }
  } else {
    console.log(chalk.green("\nApplied successfully\n"));
  }
  executor.clearStaging();
}