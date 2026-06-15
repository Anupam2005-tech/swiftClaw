import * as p from "@clack/prompts";
import { loadSwiftClawEnv, writeEnvFile } from "../utils/config.ts";
import type { Profession } from "./types.ts";
import { PROFESSIONS } from "./types.ts";
import { memoryStoreExists, saveMemoryStore, updateProfile } from "./store.ts";

const PROFESSION_OPTIONS: { value: Profession; label: string }[] = [
  { value: "doctor", label: "Doctor" },
  { value: "engineer", label: "Engineer" },
  { value: "student", label: "Student" },
  { value: "corporate", label: "Corporate" },
  { value: "other", label: "Other" },
];

export async function runMemoryOnboarding(): Promise<boolean> {
  if (memoryStoreExists()) return true;

  const defaultName = process.env.USER_NAME?.trim();

  p.intro("swiftClaw Memory Setup");

  const name = await p.text({
    message: "What should swiftClaw call you?",
    placeholder: "Your name",
    defaultValue: defaultName || undefined,
    validate: (value) => {
      if (!value?.trim()) return "Name is required";
    },
  });
  if (p.isCancel(name)) {
    p.cancel("Memory setup cancelled.");
    return false;
  }

  const profession = await p.select({
    message: "What best describes your profession?",
    options: PROFESSION_OPTIONS,
  });
  if (p.isCancel(profession)) {
    p.cancel("Memory setup cancelled.");
    return false;
  }

  let professionCustom: string | undefined;
  if (profession === "other") {
    const custom = await p.text({
      message: "Describe your profession",
      validate: (value) => {
        if (!value?.trim()) return "Profession is required when selecting Other";
      },
    });
    if (p.isCancel(custom)) {
      p.cancel("Memory setup cancelled.");
      return false;
    }
    professionCustom = String(custom).trim();
  }

  if (!PROFESSIONS.includes(profession as Profession)) {
    p.cancel("Invalid profession selected.");
    return false;
  }

  const store = updateProfile({
    name: String(name).trim(),
    profession: profession as Profession,
    ...(professionCustom ? { professionCustom } : {}),
  });

  saveMemoryStore(store);
  writeEnvFile({ USER_NAME: store.profile.name });

  p.outro("Memory profile saved. swiftClaw will remember you across sessions.");
  return true;
}

export async function ensureMemoryOnboarding(): Promise<boolean> {
  if (memoryStoreExists()) return true;
  return runMemoryOnboarding();
}
