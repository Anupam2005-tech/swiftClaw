## 1. Modify runPlanSteps to Retain Context

- [x] 1.1 Refactor `runPlanSteps` in `agent-run.ts` to instantiate a single `ToolLoopAgent` outside the step loop.
- [x] 1.2 Update the step execution loop to feed sequential prompts to the single agent, ensuring conversation history is preserved if supported, or manually appended if necessary.

## 2. Enhance Step Progress Reporting

- [x] 2.1 Before running each step in `runPlanSteps`, send a Telegram message to the user formatted as `*Executing Step X/Y:* [Title]\n_[Description]_`.
- [x] 2.2 Collect and reply with the agent's textual output at the end of each step.

## 3. Transition Feedback

- [x] 3.1 Update `plan-session.ts` to clear inline keyboards immediately after the user clicks "✅ Run Plan".
- [x] 3.2 Add an initial message to the user acknowledging the start of the execution sequence before the first step begins.
- [x] 3.3 Ensure that after all steps are completed, `finishOrApprove` is called to present the final review buttons to the user.
