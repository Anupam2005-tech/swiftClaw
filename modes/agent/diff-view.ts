import { createTwoFilesPatch } from "diff";
import chalk from "chalk";
import type { ActionLog } from "./types";

export function formatPatch(filepath: string, before: string, after: string): string {
    const patch = createTwoFilesPatch(filepath, filepath, before, after, "", "", { context: 3 });
    return patch
        .split("\n")
        .map((line) => {
            if (line.startsWith("+") && !line.startsWith("+++")) return chalk.green(line);
            if (line.startsWith("-") && !line.startsWith("---")) return chalk.red(line);
            if (line.startsWith("@@")) return chalk.cyan(line);
            if (line.startsWith("+++") || line.startsWith("---") || line.startsWith("Index:") || line.startsWith("===")) {
                return chalk.bold(line);
            }
            return line;
        })
        .join("\n");
}

export function composeBeforeAfter(sorted: ActionLog[]): { before: string; after: string } {
    const first = sorted[0]!;
    const last = sorted[sorted.length - 1]!;
    if (last.type === "file_delete") return { before: last.details.before ?? "", after: "" };
    const before = first.type === "file_create" ? "" : first.details.before ?? "";
    const after = last.details.after ?? last.details.content ?? "";
    return { before, after };
}