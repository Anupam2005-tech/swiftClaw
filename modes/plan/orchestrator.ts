import chalk from "chalk";
import { confirm, isCancel, text, spinner, log } from "@clack/prompts";
import { ToolLoopAgent, stepCountIs } from "ai";
import { getAgentModel } from "../../ai/ai.config";
import { ActionTracker } from "../agent/action-tracker";
import { CliActionTracker } from "../../utils/action-tracker";
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
import { THEME } from "../../tui/wakeup";


function stepPrompt(goal: string, step: PlanStep): string {
  return [`Goal: ${goal}`, `Step: ${step.title}`, step.description].join('\n');
}

export async function runPlanMode(): Promise<void> {
  console.log(`\n  ${THEME.accent("»")} ${THEME.primary("Plan Mode Initialized")}\n`);

  const goal = await text({
    message: THEME.primary("Define your architectural objective:"),
  });
  if (isCancel(goal) || !goal.trim()) return;

  const plan = await generatePlan(goal);

  printPlan(plan);

  const selected = await selectSteps(plan);
  if (selected.length === 0) return;
  const proceed = await confirm({
    message: THEME.primary(`Initialize execution for ${selected.length} step(s)?`),
    initialValue: true,
  });
  if (isCancel(proceed) || !proceed) return;

  const config = defaultAgentConfig();
  const internalTracker = new ActionTracker();
  const executor = new ToolExecutor(internalTracker, config);
  const uiTracker = new CliActionTracker();

  const hasweb = !!process.env.FIRECRAWL_API_KEY;
  const tools = {
    ...createAgentTools(executor, uiTracker),
    ...(hasweb ? createWebTools(internalTracker, uiTracker) : {}),
  };

  for (const step of selected) {
    console.log(`\n  ${THEME.accent("»")} ${THEME.primary(`Executing Phase: ${step.title}`)}\n`);
    uiTracker.start("Agent synthesizing...");
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
            `${THEME.accent("✓")} ${THEME.primary(String(toolCall.toolName))} ${THEME.secondary(preview + (preview.length >= 200 ? "..." : ""))}`
          );
        }
        uiTracker.update("Refining output...");
      },
    });
    uiTracker.stop("Synthesis complete.");
    if (result.text?.trim()) {
      console.log(renderTerminalMarkdown(result.text));
    }
  }

  const ok = await runApprovalFlow(internalTracker);
  if (!ok) return executor.clearStaging();

  const errors = executor.applyApprovedFromTracker();
  if (errors.length) {
    console.log(THEME.error("\n Some operations reported errors...\n"));
    for (const e of errors) {
      console.log(THEME.error(` ${e}`));
    }
  } else {
    console.log(THEME.accent("\n  Modifications applied successfully.\n"));
  }
  executor.clearStaging();
}