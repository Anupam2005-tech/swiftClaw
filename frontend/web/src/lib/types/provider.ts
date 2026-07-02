export type ProviderId =
  | "gemini"
  | "openai"
  | "groq"
  | "nvidia";

export interface ProviderInfo {
  id: ProviderId;
  name: string;
  description: string;
  keyUrl: string;
  icon?: string;
  capabilities: TaskType[];
}

export type TaskType =
  | "chat"
  | "web_search"
  | "file_analysis"
  | "image_analysis"
  | "image_generation"
  | "video_analysis"
  | "video_generation";

export interface ModelPreference {
  task: TaskType;
  provider: ProviderId;
  model: string;
}

export type ModelPreferences = Record<TaskType, ModelPreference>;

export interface KeyMeta {
  provider: ProviderId;
  added_at: string;
  last_used?: string;
  validated: boolean;
}
