import { ActionTracker } from "./action-tracker";
import { select, isCancel } from "@clack/prompts";
import chalk from "chalk";
import type { ActionLog } from "./types";
import { formatPatch, composeBeforeAfter } from "./diff-view";

interface ReviewGroup {
  label: string;
  actionId: string[];
  patch: string | null;
}

export function groupPending(pending: ActionLog[]): ReviewGroup[] {
  const bypath = new Map<string, ActionLog[]>();

  for (const a of pending) {
    if (a.type === "tool_execute") continue;
    const key = a.path;
    if (!bypath.has(key)) {
      bypath.set(key, []);
    }
    bypath.get(key)!.push(a);
  }

  const groups: ReviewGroup[] = [];
  const processedPaths = new Set<string>();

  for (const a of pending) {
    if (a.type === "tool_execute") {
      groups.push({
        label: `Execute shell command: ${a.details.command ?? ""}`,
        actionId: [a.id],
        patch: null,
      });
    } else {
      if (processedPaths.has(a.path)) continue;
      processedPaths.add(a.path);
      const list = bypath.get(a.path)!;

      if (list.some((x) => x.type === "folder_create")) {
        groups.push({
          label: `Create folder: ${a.path}`,
          actionId: list.map((x) => x.id),
          patch: null,
        });
      } else {
        const first = list[0]!;
        const last = list[list.length - 1]!;
        let label = "";

        if (last.type === "file_delete") {
          if (first.type === "file_create") {
            label = `Create & Delete file: ${a.path}`;
          } else {
            label = `Delete file: ${a.path}`;
          }
        } else if (first.type === "file_create") {
          label = `Create file: ${a.path}`;
        } else {
          label = `Modify file: ${a.path}`;
        }

        const { before, after } = composeBeforeAfter(list);
        const patch = formatPatch(a.path, before, after);

        groups.push({
          label,
          actionId: list.map((x) => x.id),
          patch,
        });
      }
    }
  }

  return groups;
}

export async function runApprovalFlow(
  tracker: ActionTracker,
): Promise<boolean> {
  const pending = tracker.getPendingMutations();

  if (!pending.length) {
    console.log(chalk.dim("\n No Staged file, folder or shell to review.\n"));
    return false;
  }
  const choice = await select({
    message: chalk.cyan("\nPending changes ready for review\n"),
    options: [
      { value: "approve", label: "Approve and apply all" },
      { value: "reject", label: "Reject Changes" },
      { value: "select", label: "Review one by one" },
    ],
  });
  if (isCancel(choice) || choice === "reject") {
    for (const a of pending) tracker.updateStatus(a.id, "rejected", false);
    return false;
  } else if (choice === "approve") {
    for (const a of pending) tracker.updateStatus(a.id, "approved", true);
    return true;
  } else {
    const groups = groupPending(pending);
    let anyApproved = false;
    for (let i = 0; i < groups.length; i++) {
      const g = groups[i]!;
      console.log(`\n${chalk.bold.cyan(`[Group ${i + 1}/${groups.length}]`)} ${chalk.bold(g.label)}`);
      if (g.patch) {
        console.log(g.patch);
      }
      const action = await select({
        message: `Action for this group:`,
        options: [
          { value: "approve", label: "Approve this change" },
          { value: "reject", label: "Reject this change" },
          { value: "abort", label: "Abort review (reject all remaining)" },
        ],
      });

      if (isCancel(action) || action === "abort") {
        for (let j = i; j < groups.length; j++) {
          for (const id of groups[j]!.actionId) {
            tracker.updateStatus(id, "rejected", false);
          }
        }
        return false;
      }

      if (action === "approve") {
        for (const id of g.actionId) {
          tracker.updateStatus(id, "approved", true);
        }
        anyApproved = true;
      } else {
        for (const id of g.actionId) {
          tracker.updateStatus(id, "rejected", false);
        }
      }
    }
    return anyApproved;
  }
}