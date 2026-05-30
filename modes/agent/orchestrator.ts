import { isCancel, text, log } from "@clack/prompts";
import chalk from "chalk";
import { defaultAgentConfig } from "./types";
import { ActionTracker as InternalTracker } from "./action-tracker";
import { CliActionTracker } from "../../utils/action-tracker";
import { ToolExecutor } from "./tool-executor";
import { createAgentTools } from "./agent-tools";
import { stepCountIs, ToolLoopAgent } from "ai";
import { getAgentMode } from "../../ai";
import { renderTerminalMarkdown } from "../../tui/termina-md";
import { runApprovalFlow } from "./approvals";
import { THEME } from "../../tui/wakeup";
import { getAgentSystemPrompt } from "../prompts";
import { formatAiError } from "../../utils/config.ts";

export async function runAgentmode() {
  console.log(`\n  ${THEME.accent("»")} ${THEME.primary("Agent Mode Initialized")}\n`);

  const goal = await text({
    message: THEME.primary("Define the agent's objective:"),
    placeholder: "e.g., Implement authentication workflow",
  });
  if (isCancel(goal) || !goal.trim()) return;

  const config = defaultAgentConfig();
  const internalTracker = new InternalTracker();
  const executor = new ToolExecutor(internalTracker, config);
  const uiTracker = new CliActionTracker();
  const tools = createAgentTools(executor, uiTracker);

  const agent = new ToolLoopAgent({
    model: getAgentMode(),
    stopWhen: stepCountIs(40),
    instructions: getAgentSystemPrompt(config.codebasePath),
    tools,
  });

  uiTracker.start("Agent synthesizing...");

  try {
    const result = await agent.generate({
      prompt: goal?.trim(),
      onStepFinish: ({ toolCalls }) => {
        if (toolCalls.length > 0) {
          uiTracker.stop("Orchestration complete.");
          for (const toolCall of toolCalls) {
            const preview = JSON.stringify(toolCall.input).slice(0, 200);
            log.step(
              `${THEME.accent("✓")} ${THEME.primary(String(toolCall.toolName))} ${THEME.secondary(preview + (preview.length >= 200 ? "..." : ""))}`
            );
          }
          uiTracker.start("Refining output...");
        } else {
          uiTracker.update("Refining output...");
        }
      },
    });

    uiTracker.stop("Synthesis complete.");
    if (result.text?.trim()) console.log(renderTerminalMarkdown(result.text));

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
  } catch (error: unknown) {
    uiTracker.stop("Engine fault: Generation failed.");
    log.error(THEME.error(`AI generation failed: ${formatAiError(error)}`));
  }
}