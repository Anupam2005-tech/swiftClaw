import { ProviderId } from "./provider";

export interface FileAttachment {
  name: string;
  size: number;
  type: string;
  mime_type?: string;
  dataUrl?: string; // base64 or object URL for client preview
  contentUrl?: string; // final URL
  content?: string; // persisted base64 (images) or text (documents) from Firestore
}

export interface Source {
  filename: string;
  page?: number;
  snippet: string;
  url?: string;
}

export interface ToolCall {
  id: string;
  tool: string;
  args: Record<string, unknown>;
  result?: string;
  status: "pending" | "success" | "error";
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
  provider?: ProviderId;
  model?: string;
  attachments?: FileAttachment[];
  sources?: Source[];
  status?: "streaming" | "done" | "interrupted" | "error" | "queued";
  tool_calls?: ToolCall[];
  media_job_id?: string; // for v1.4 async video jobs
  image_url?: string; // for v1.3 image generation
}

export interface Conversation {
  id: string;
  title: string;
  last_message_preview: string;
  created_at: string;
  updated_at: string;
  pinned?: boolean;
}

export interface LobbyImage {
  id: string;
  conversation_id: string;
  conversation_title: string;
  image_url: string;
  created_at: string;
  prompt: string;
}
