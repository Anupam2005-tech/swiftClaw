## Context

Currently, in the Telegram bot interface, a user can generate a plan using `/plan`. When the plan is ready, they are presented with an option to `✅ Run Plan`. However, the execution logic (`runPlanSteps`) uses a newly instantiated `ToolLoopAgent` for each step, which means the agent loses the conversational and execution context from previous steps. Furthermore, we want a robust mechanism that clearly communicates the transition into a dedicated "Plan Execution Agent" mode, ensuring seamless step-by-step execution and progress updates to the user.

## Goals / Non-Goals

**Goals:**
- Provide a seamless transition for the user from Plan approval to Agent execution.
- Maintain agent context across the execution of different steps of a plan.
- Create a `PlanExecutionAgent` or modify the execution loop so that the same agent instance processes all steps sequentially, preserving memory/context.
- Report real-time, step-by-step progress to the Telegram user.

**Non-Goals:**
- Allowing the user to pause/resume the execution of steps (they can either approve or cancel).
- Modifying the underlying `ToolLoopAgent` core loop logic (just how we instantiate and prompt it).

## Decisions

1. **Stateful Agent Instance**: Instead of instantiating a new `ToolLoopAgent` for every step, we will instantiate a single `ToolLoopAgent` at the beginning of `runPlanSteps`. We will then feed it prompts sequentially for each step. Since `ToolLoopAgent` might not natively support maintaining a long-running session across multiple `generate()` calls right now without re-injecting history, we'll design a `PlanExecutionAgent` wrapper or modify `runPlanSteps` to keep track of the conversation history or simply append step results to a running context.
   *Alternative*: Let the agent have a single prompt containing all steps, but this loses the granular "step-by-step" reporting to the user. Sequential prompting with shared history is better.

2. **Step Progress Reporting**: Before each step is sent to the agent, a Telegram message will be sent: `*Executing Step X/Y:* [Title]`. After the step completes, any textual output from the agent is sent back to the user.

3. **Transition Feedback**: When the user clicks `✅ Run Plan`, the message will immediately update to indicate that the agent has taken over and is initializing the execution environment.

## Risks / Trade-offs

- **Risk:** The context window might grow too large if the plan has many steps and the agent generates a lot of output.
  *Mitigation:* Keep the intermediate step prompts concise. If `ToolLoopAgent` handles history automatically, monitor token usage. If it doesn't, we just feed the agent the overall goal, previous steps' summaries, and the current step's task.
- **Risk:** A step fails.
  *Mitigation:* If a step fails, the loop should gracefully handle the error, notify the user, and perhaps abort the remaining steps, moving to the `finishOrApprove` phase so the user can save what was done.
