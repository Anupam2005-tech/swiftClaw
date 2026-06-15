export const PROFESSIONS = [
  "doctor",
  "engineer",
  "student",
  "corporate",
  "other",
] as const;

export type Profession = (typeof PROFESSIONS)[number];

export type MemoryFactCategory = "preference" | "context" | "workflow";
export type MemoryFactSource = "setup" | "explicit" | "inferred";

export interface MemoryFact {
  id: string;
  content: string;
  category: MemoryFactCategory;
  source: MemoryFactSource;
  createdAt: string;
  updatedAt: string;
}

export interface MemoryPreferences {
  communicationStyle?: string;
  tone?: string;
  responseLength?: string;
  codingStyle?: string;
}

export interface MemoryProfile {
  name: string;
  profession: Profession;
  professionCustom?: string;
}

export interface MemoryStore {
  version: 1;
  profile: MemoryProfile;
  preferences: MemoryPreferences;
  facts: MemoryFact[];
}

export interface MemoryPatch {
  preferences?: Partial<MemoryPreferences>;
  facts?: Array<{ content: string; category: MemoryFactCategory }>;
}
