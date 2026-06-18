export type IntegrationId =
  | "github"
  | "notion"
  | "slack"
  | "linear"
  | "google_drive"
  | "brave_search";

export interface Integration {
  id: IntegrationId;
  name: string;
  description: string;
  enabled: boolean;
  connected_at?: string;
  last_synced_at?: string;
}
