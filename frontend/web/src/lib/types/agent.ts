export type SSEEvent =
  | { type: "text_delta"; content: string }
  | { type: "tool_call"; id: string; tool: string; args: Record<string, unknown> }
  | { type: "tool_result"; id: string; tool: string; content: string }
  | { type: "provider_switch"; from: string; to: string; reason: string }
  | { type: "low_confidence"; confidence: number; message: string }
  | { type: "done"; message_id: string }
  | { type: "error"; code: string; message: string }
  | { type: "image_generated"; url: string } // v1.3 — frontend-assumed
  | { type: "media_job_started"; job_id: string; kind: "video" }; // v1.4 — frontend-assumed

export interface MediaJob {
  id: string;
  status: "queued" | "processing" | "done" | "failed";
  kind: "video";
  url?: string;
  error?: string;
  progress?: number;
  created_at: string;
}
