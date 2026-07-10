import { User, ActiveSession } from "../types/user";
import { KeyMeta, ProviderId, ModelPreferences } from "../types/provider";
import { Conversation, Message, FileAttachment, LobbyImage } from "../types/conversation";
import { Integration, IntegrationId } from "../types/integration";
import { MediaJob, SSEEvent } from "../types/agent";

const isBrowser = typeof window !== "undefined";

const DEFAULT_PREFERENCES: ModelPreferences = {
  chat: { task: "chat", provider: "gemini", model: "gemini-1.5-flash" },
  web_search: { task: "web_search", provider: "gemini", model: "gemini-1.5-flash" },
  file_analysis: { task: "file_analysis", provider: "gemini", model: "gemini-1.5-flash" },
  image_analysis: { task: "image_analysis", provider: "openai", model: "gpt-4o" },
  image_generation: { task: "image_generation", provider: "openai", model: "dall-e-3" },
  video_analysis: { task: "video_analysis", provider: "gemini", model: "gemini-1.5-pro" },
  video_generation: { task: "video_generation", provider: "nvidia", model: "nvidia/llama-3.1-nemotron-70b-instruct" },
};

const getApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
};

// Helper to get cookie
const getCookie = (name: string): string => {
  if (!isBrowser) return "";
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || "";
  return "";
};

const getAuthToken = async (): Promise<string> => {
  try {
    const { auth } = await import("../firebase/config");
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
  } catch (e) {
    console.error("Firebase config import error:", e);
  }
  return "";
};

async function apiRequest(path: string, options: RequestInit = {}) {
  const url = `${getApiUrl()}${path}`;
  const token = await getAuthToken();
  const sessionId = getCookie("sc_session_id");

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (sessionId) {
    headers.set("X-Session-Id", sessionId);
  }
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    let errorDetail = "API request failed";
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || JSON.stringify(errJson);
    } catch (_) {}
    throw new Error(errorDetail);
  }

  if (response.status === 204) {
    return;
  }

  return await response.json();
}

let lastActiveConversationId: string | null = null;

export const api = {
  // Authentication
  async signIn(email: string, provider: string): Promise<{ uid: string; session_id: string; onboarding_complete: boolean }> {
    // Auth starts at useAuth.tsx. We trigger API call to verify and create session.
    const res = await apiRequest("/api/auth/session", {
      method: "POST",
      body: JSON.stringify({
        device_info: typeof navigator !== "undefined" ? navigator.userAgent : "Web",
      }),
    });

    let onboarding_complete = false;
    try {
      const status = await apiRequest("/api/onboarding/status");
      onboarding_complete = status.is_onboarded;
    } catch (e) {
      console.error("Failed to check onboarding status:", e);
    }

    const { auth } = await import("../firebase/config");
    const uid = auth.currentUser?.uid || "";

    return {
      uid,
      session_id: res.session_id,
      onboarding_complete,
    };
  },

  async signOut(): Promise<void> {
    try {
      await apiRequest("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Failed to log out backend session:", e);
    }
    const { auth } = await import("../firebase/config");
    await auth.signOut();
  },

  async getCurrentUser(): Promise<User | null> {
    if (!isBrowser) return null;
    const { auth } = await import("../firebase/config");
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;

    let onboarding_complete = false;
    try {
      const status = await apiRequest("/api/onboarding/status");
      onboarding_complete = status.is_onboarded;
    } catch (e) {
      console.error("Failed to fetch onboarding status:", e);
    }

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || "",
      onboarding_complete,
      created_at: firebaseUser.metadata.creationTime || new Date().toISOString(),
    };
  },

  async listSessions(): Promise<ActiveSession[]> {
    return await apiRequest("/api/auth/sessions");
  },

  async revokeSession(sessionId: string): Promise<void> {
    await apiRequest(`/api/auth/sessions/${sessionId}`, { method: "DELETE" });
  },

  async revokeAllSessions(): Promise<void> {
    await apiRequest("/api/auth/logout-all", { method: "POST" });
  },

  // Onboarding
  async getOnboardingStatus(): Promise<{ has_key: boolean; keys_count: number; preferences_set: boolean; onboarding_complete: boolean }> {
    const status = await apiRequest("/api/onboarding/status");
    const keys = await apiRequest("/api/keys");
    return {
      has_key: status.has_keys,
      keys_count: keys.length,
      preferences_set: status.has_preferences,
      onboarding_complete: status.is_onboarded,
    };
  },

  async completeOnboarding(): Promise<void> {
    // Backend determines onboarding dynamically based on keys & preferences.
  },

  async saveProfile(profile: { nickname?: string; profession?: string }): Promise<void> {
    await apiRequest("/api/onboarding/profile", {
      method: "POST",
      body: JSON.stringify(profile),
    });
  },

  async getProfile(): Promise<{ nickname: string; profession: string; email: string }> {
    return await apiRequest("/api/onboarding/profile");
  },

  async deleteAccount(): Promise<void> {
    await apiRequest("/api/auth/delete-account", { method: "DELETE" });
  },

  async refreshModels(provider: ProviderId): Promise<{ provider: string; models: any[]; error?: any }> {
    return await apiRequest(`/api/keys/${provider}/refresh`, { method: "POST" });
  },

  async getLobbyImages(): Promise<LobbyImage[]> {
    return await apiRequest("/api/chat/lobby-images");
  },

  // Model Preferences
  async getPreferences(): Promise<ModelPreferences> {
    try {
      const backendPrefs = await apiRequest("/api/onboarding/preferences");
      if (backendPrefs && Object.keys(backendPrefs).length > 0) {
        // Preferences format in backend: {"chat": "openai:gpt-4o", ...}
        // Map to ModelPreferences structure
        const mappedPrefs: any = {};
        for (const [task, val] of Object.entries(backendPrefs)) {
          if (typeof val === "string" && val.includes(":")) {
            const [provider, model] = val.split(":");
            mappedPrefs[task] = { task, provider, model };
          }
        }
        return { ...DEFAULT_PREFERENCES, ...mappedPrefs };
      }
    } catch (e) {
      console.error("Failed to load backend preferences, using local storage/defaults:", e);
    }

    if (!isBrowser) return DEFAULT_PREFERENCES;
    const stored = localStorage.getItem("sc_preferences");
    return stored ? JSON.parse(stored) : DEFAULT_PREFERENCES;
  },

  async setPreferences(prefs: ModelPreferences): Promise<void> {
    if (isBrowser) {
      localStorage.setItem("sc_preferences", JSON.stringify(prefs));
    }
    
    // Map ModelPreferences to backend Format: {"chat": "openai:gpt-4o", ...}
    const backendPrefs: Record<string, string> = {};
    for (const [task, val] of Object.entries(prefs)) {
      if (val && val.provider && val.model) {
        backendPrefs[task] = `${val.provider}:${val.model}`;
      }
    }

    try {
      await apiRequest("/api/onboarding/set-preferences", {
        method: "POST",
        body: JSON.stringify({ preferences: backendPrefs }),
      });
    } catch (e) {
      console.error("Failed to sync preferences to backend:", e);
    }
  },

  // Keys Management
  async listKeys(): Promise<KeyMeta[]> {
    return await apiRequest("/api/keys");
  },

  async addKey(provider: ProviderId, key: string): Promise<{ success: boolean; error?: string }> {
    try {
      await apiRequest(`/api/keys/${provider}`, {
        method: "POST",
        body: JSON.stringify({ api_key: key }),
      });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || "Failed to add key" };
    }
  },

  async removeKey(provider: ProviderId): Promise<void> {
    await apiRequest(`/api/keys/${provider}`, { method: "DELETE" });
  },

  async getMaskedKey(provider: ProviderId): Promise<string> {
    try {
      const keys = await this.listKeys();
      const key = keys.find((k) => k.provider === provider);
      if (key) {
        return "••••••••••••";
      }
    } catch (e) {
      console.error("Failed to list keys to check masking:", e);
    }
    return "";
  },

  // Conversations & History
  async listConversations(limit?: number, offset?: number): Promise<Conversation[]> {
    let path = "/api/chat";
    const params: string[] = [];
    if (limit !== undefined) params.push(`limit=${limit}`);
    if (offset !== undefined) params.push(`offset=${offset}`);
    if (params.length > 0) path += `?${params.join("&")}`;
    const list = await apiRequest(path) as any[];
    return list.map((c) => ({
      id: c.id,
      title: c.title,
      last_message_preview: c.summary || "",
      created_at: c.created_at,
      updated_at: c.updated_at,
      pinned: c.pinned || false,
    }));
  },

  async batchDeleteConversations(ids: string[]): Promise<void> {
    await Promise.all(ids.map((id) => this.deleteConversation(id)));
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    const raw = await apiRequest(`/api/chat/${conversationId}/messages`) as any[];
    return raw.map((m) => {
      const msg: Message = {
        id: m.id,
        role: m.role,
        content: m.content || "",
        created_at: m.created_at,
        provider: m.metadata?.provider,
        model: m.metadata?.model,
        status: m.status || "completed",
        attachments: m.attachments?.map((att: any) => ({
          name: att.name,
          size: att.size || 0,
          type: att.type || att.mime_type,
          mime_type: att.mime_type,
          content: att.content,
          dataUrl: att.storageUrl
            ? att.storageUrl
            : att.content && att.type?.startsWith("image/")
            ? `data:${att.mime_type || att.type};base64,${att.content}`
            : undefined,
          storageUrl: att.storageUrl,
        })),
      };
      return msg;
    });
  },

  async createConversation(title?: string): Promise<Conversation> {
    // Backend creates conversation on the first chat stream message automatically.
    return {
      id: `conv_${Math.random().toString(36).substring(2, 11)}`,
      title: title || "New Conversation",
      last_message_preview: "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  },

  async deleteConversation(conversationId: string): Promise<void> {
    await apiRequest(`/api/chat/${conversationId}`, { method: "DELETE" });
  },

  async addMessage(conversationId: string, message: Omit<Message, "created_at">): Promise<Message> {
    // Backend records messages automatically during chat streams
    return {
      ...message,
      created_at: new Date().toISOString(),
    };
  },

  async updateMessage(conversationId: string, messageId: string, updates: Partial<Message>): Promise<Message> {
    return {
      id: messageId,
      role: "assistant",
      content: "",
      created_at: new Date().toISOString(),
      ...updates,
    };
  },

  async uploadFile(file: File, conversationId: string): Promise<{ url: string; object_key: string; filename: string }> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("conversation_id", conversationId);
    return await apiRequest("/api/upload", {
      method: "POST",
      body: formData,
    });
  },

  async *sendChatMessage(
    conversationId: string,
    message: string,
    rawFiles: File[] = [],
    attachments: FileAttachment[] = [],
    mode: "chat" | "image" | "video" = "chat",
    webSearch: boolean = false,
    userMessageId?: string,
    assistantMessageId?: string
  ): AsyncGenerator<SSEEvent, void, unknown> {
    lastActiveConversationId = conversationId;
    const url = `${getApiUrl()}/api/chat/stream`;
    const token = await getAuthToken();
    const sessionId = getCookie("sc_session_id");

    const formData = new FormData();
    formData.append("conversation_id", conversationId);
    formData.append("message", message);
    formData.append("web_search", webSearch ? "true" : "false");
    if (userMessageId) {
      formData.append("user_message_id", userMessageId);
    }
    if (assistantMessageId) {
      formData.append("assistant_message_id", assistantMessageId);
    }
    
    if (attachments && attachments.length > 0) {
      formData.append("attachments_metadata", JSON.stringify(attachments));
    }

    if (rawFiles && rawFiles.length > 0) {
      for (const f of rawFiles) {
        formData.append("files", f, f.name);
      }
    }

    const headers = new Headers();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    if (sessionId) {
      headers.set("X-Session-Id", sessionId);
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Streaming request failed: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Response body is not readable");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;

          const jsonStr = trimmed.slice(6);
          try {
            const event = JSON.parse(jsonStr) as SSEEvent;
            yield event;
          } catch (e) {
            console.error("Error decoding SSE message:", e);
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  },

  async stopStream(conversationId?: string): Promise<void> {
    const targetId = conversationId || lastActiveConversationId;
    if (targetId) {
      try {
        await apiRequest(`/api/chat/stop?conversation_id=${encodeURIComponent(targetId)}`, {
          method: "POST",
          body: new URLSearchParams({ conversation_id: targetId }),
        });
      } catch (e) {
        console.error("Failed to request stream termination:", e);
      }
    }
  },

  // Memory import
  async importMemory(content: string, nickname?: string, profession?: string): Promise<{ success: boolean }> {
    return await apiRequest("/api/memory/import", {
      method: "POST",
      body: JSON.stringify({ content, nickname, profession }),
    });
  },

  // Integrations MCP (Backend placeholder)
  async listIntegrations(): Promise<Integration[]> {
    return [];
  },
  async toggleIntegration(id: IntegrationId, enabled: boolean): Promise<void> {},

  // Media rendering jobs (Backend placeholder)
  async getMediaJob(jobId: string): Promise<MediaJob> {
    return {
      id: jobId,
      status: "done",
      kind: "video",
      url: "",
      created_at: new Date().toISOString(),
    };
  },

  // Pinning and Sharing Conversations
  async shareConversation(conversationId: string): Promise<{ id: string; title: string }> {
    return await apiRequest(`/api/chat/${conversationId}/share`, {
      method: "POST",
    });
  },

  async getSharedConversation(conversationId: string): Promise<any> {
    return await apiRequest(`/api/chat/shared/${conversationId}`, {
      method: "GET",
    });
  },

  async pinConversation(conversationId: string, pinned: boolean): Promise<{ status: string; pinned: boolean }> {
    return await apiRequest(`/api/chat/${conversationId}/pin`, {
      method: "POST",
      body: JSON.stringify({ pinned }),
    });
  },
};
