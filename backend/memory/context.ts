import { formatMemoryContext } from "./format.ts";
import { loadMemoryStore } from "./store.ts";

export function getMemoryContextBlock(): string {
  return formatMemoryContext(loadMemoryStore());
}
