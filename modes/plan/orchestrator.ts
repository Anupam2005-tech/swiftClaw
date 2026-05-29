import chalk from "chalk";
import { confirm, isCancel, text, spinner, log } from "@clack/prompts";
import { ToolLoopAgent, stepCountIs } from "ai";
import { getAgentModel } from "../../ai/ai.config";
import { ActionTracker } from "../agent/action-tracker";
import { ToolExecutor } from "../agent/tool-executor";
import { createAgentTools } from "../agent/agent-tools";
import { defaultAgentConfig } from "../agent/types";
import { runApprovalFlow } from "../agent/approvals";
import { renderTerminalMarkdown } from "../../tui/termina-md";
import { generatePlan } from "./planner";
import { printPlan, selectSteps } from "./printPlan";
import type { PlanStep } from "./types.ts";
import { createWebTools } from "./web-tools";
import { getPlanStepExecutionPrompt } from "../prompts";


function stepPrompt(goal: string, step: PlanStep): string {
  return [`Goal: ${goal}`, `Step: ${step.title}`, step.description].join('\n');
}

export async function runPlanMode(): Promise<void> {
  console.log(chalk.bold(" \n Plan Mode \n"));

  const goal = await text({
    message: "What would you like to build today?",
  });
  if (isCancel(goal) || !goal.trim()) return;

  const plan = await generatePlan(goal);

  printPlan(plan);

  const selected = await selectSteps(plan);
  if (selected.length === 0) return;
  const proceed = await confirm({
    message: `Execute ${selected.length} step(s)`,
    initialValue: true,
  });
  if (isCancel(proceed) || !proceed) return;

  const config = defaultAgentConfig();
  const tracker = new ActionTracker();
  const executor = new ToolExecutor(tracker, config);

  const hasweb = !!process.env.FIRECRAWL_API_KEY;
  const tools = {
    ...createAgentTools(executor),
    ...(hasweb ? createWebTools(tracker) : {}),
  };

  const s = spinner();
  for (const step of selected) {
    console.log(chalk.bold(`\nExecuting Step: ${step.title}\n`));
    s.start("Agent is thinking...");
    const agent = new ToolLoopAgent({
      model: getAgentModel(),
      stopWhen: stepCountIs(30),
      instructions: getPlanStepExecutionPrompt(
        config.codebasePath,
        plan.goal,
        selected.indexOf(step) + 1,
        selected.length,
        step.title,
      ),
      tools
    });
    const result = await agent.generate({
      prompt: stepPrompt(plan.goal, step),
      onStepFinish: ({ toolCalls }) => {
        for (const toolCall of toolCalls) {
          if (!toolCall) continue;
          const preview = JSON.stringify(toolCall.input).slice(0, 200);
          log.step(
            `${chalk.green("✓")} ${chalk.bold(String(toolCall.toolName))} ${chalk.dim(preview + (preview.length >= 200 ? "..." : ""))}`
          );
        }
        s.message("Refining response...");
      },
    });
    s.stop("Finished thinking.");
    if (result.text?.trim()) {
      console.log(renderTerminalMarkdown(result.text));
    }
  }

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