"use client";

import { useState, useRef, useCallback } from "react";
import { Message, FileAttachment, ToolCall } from "../types/conversation";
import { api } from "../api/client";
import { SSEEvent } from "../types/agent";
import { useToast } from "@/components/ui/toast";

export const useChatStream = (
  conversationId: string,
  onStreamComplete?: () => void
) => {
  const [streaming, setStreaming] = useState(false);
  const [providerSwitch, setProviderSwitch] = useState<{ from: string; to: string; reason: string } | null>(null);
  const activeStreamRef = useRef<boolean>(false);
  const { toast } = useToast();

  const queueRef = useRef<{
    text: string;
    attachments: FileAttachment[];
    rawFiles: File[];
    mode: "chat" | "image" | "video";
    webSearchEnabled: boolean;
    setMessagesList: React.Dispatch<React.SetStateAction<Message[]>>;
    userMessageId?: string;
  }[]>([]);

  const runGenerator = useCallback(
    async (
      text: string,
      attachments: FileAttachment[],
      rawFiles: File[],
      mode: "chat" | "image" | "video",
      setMessagesList: React.Dispatch<React.SetStateAction<Message[]>>,
      webSearchEnabled: boolean,
      userMessageId?: string,
      assistantMessageId?: string
    ) => {
      activeStreamRef.current = true;
      setStreaming(true);
      setProviderSwitch(null);

      const assistantMsgId = assistantMessageId || `msg_a_${Math.random().toString(36).substring(2, 9)}`;

      if (assistantMessageId) {
        setMessagesList((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content: "",
                  status: "streaming",
                  tool_calls: [],
                  provider: undefined,
                  sources: undefined,
                  image_url: undefined,
                  media_job_id: undefined,
                }
              : msg
          )
        );
      } else {
        const assistantMessage: Message = {
          id: assistantMsgId,
          role: "assistant",
          content: "",
          created_at: new Date().toISOString(),
          status: "streaming",
          tool_calls: [],
        };
        setMessagesList((prev) => [...prev, assistantMessage]);
      }

      let currentText = "";
      let currentToolCalls: ToolCall[] = [];
      let lastEvent: SSEEvent | null = null;

      try {
        const stream = api.sendChatMessage(
          conversationId,
          text,
          rawFiles,
          mode,
          webSearchEnabled,
          userMessageId,
          assistantMsgId
        );

        for await (const event of stream) {
          if (!activeStreamRef.current) {
            break;
          }

          lastEvent = event;

          switch (event.type) {
            case "text_delta":
              currentText += event.content;
              setMessagesList((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMsgId
                    ? { ...msg, content: currentText }
                    : msg
                )
              );
              break;

            case "tool_call":
              const newToolCall: ToolCall = {
                id: event.id,
                tool: event.tool,
                args: event.args,
                status: "pending",
              };
              currentToolCalls = [...currentToolCalls, newToolCall];
              setMessagesList((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMsgId
                    ? { ...msg, tool_calls: currentToolCalls }
                    : msg
                )
              );
              break;

            case "tool_result":
              currentToolCalls = currentToolCalls.map((tc) =>
                tc.id === event.id
                  ? { ...tc, status: "success", result: event.content }
                  : tc
              );
              setMessagesList((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMsgId
                    ? { ...msg, tool_calls: currentToolCalls }
                    : msg
                )
              );
              break;

            case "provider_switch":
              setProviderSwitch({
                from: event.from,
                to: event.to,
                reason: event.reason,
              });
              setMessagesList((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMsgId
                    ? { ...msg, provider: event.to as any }
                    : msg
                )
              );
              break;

            case "low_confidence":
              setMessagesList((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMsgId
                    ? {
                        ...msg,
                        status: "done",
                      }
                    : msg
                )
              );
              break;

            case "image_generated":
              setMessagesList((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMsgId
                    ? { ...msg, image_url: event.url }
                    : msg
                )
              );
              break;

            case "media_job_started":
              setMessagesList((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMsgId
                    ? { ...msg, media_job_id: event.job_id }
                    : msg
                )
              );
              break;

            case "done":
              setMessagesList((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMsgId
                    ? {
                        ...msg,
                        status: "done",
                      }
                    : msg
                )
              );
              break;

            case "error":
              console.error("Exact stream event error code:", event.code, "message:", event.message);
              if (event.code === "invalid_key") {
                toast({
                  title: "Invalid API Key",
                  description: `Your ${event.message || "API key"} was rejected. Update it in Settings to continue using this provider.`,
                  variant: "destructive",
                  duration: 8000,
                  position: "top-right",
                });
              }
              currentText = event.message || "Something went wrong. Please try again.";
              setMessagesList((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMsgId
                    ? {
                        ...msg,
                        status: "error",
                        content: currentText,
                      }
                    : msg
                )
              );
              break;
          }
        }

        const finalAssistantMsg = {
          id: assistantMsgId,
          role: "assistant" as const,
          content: currentText,
          tool_calls: currentToolCalls,
          status: lastEvent?.type === "error" ? ("error" as const) : activeStreamRef.current ? ("done" as const) : ("interrupted" as const),
          provider: lastEvent?.type === "provider_switch" ? (lastEvent.to as any) : undefined,
        } as Message;

        if (text.toLowerCase().includes("rag") || text.toLowerCase().includes("source") || text.toLowerCase().includes("ground")) {
          finalAssistantMsg.sources = [
            {
              filename: "SwiftClaw_Frontend_FRD.md",
              page: 4,
              snippet: "The data layer is implemented as a single abstraction client.ts calling mock interfaces.",
            },
            {
              filename: "SwiftClaw_Frontend_PRD.md",
              page: 2,
              snippet: "v1.0 includes firebase-style login, guided onboarding, and streaming chat.",
            },
          ];
          setMessagesList((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId
                ? { ...msg, sources: finalAssistantMsg.sources }
                : msg
            )
          );
        }

        if (mode === "image") {
          finalAssistantMsg.image_url = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80";
          finalAssistantMsg.status = "done";
        }

        if (mode === "video") {
          const match = lastEvent?.type === "media_job_started" ? lastEvent.job_id : "";
          finalAssistantMsg.media_job_id = match;
          finalAssistantMsg.status = "done";
        }

        if (assistantMessageId) {
          await api.updateMessage(conversationId, assistantMsgId, finalAssistantMsg);
        } else {
          await api.addMessage(conversationId, finalAssistantMsg);
        }
      } catch (err) {
        console.error("Streaming error caught:", err);
        currentText = "Something went wrong. Please try again.";
        setMessagesList((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  status: "error",
                  content: currentText,
                }
              : msg
          )
        );
        try {
          const errorMsg = {
            id: assistantMsgId,
            role: "assistant" as const,
            content: currentText,
            status: "error" as const,
          } as Message;
          if (assistantMessageId) {
            await api.updateMessage(conversationId, assistantMsgId, errorMsg);
          } else {
            await api.addMessage(conversationId, errorMsg);
          }
        } catch (dbErr) {
          console.error("Failed to save error state to DB:", dbErr);
        }
      }
    },
    [conversationId, toast]
  );

  const processQueue = useCallback(async () => {
    if (queueRef.current.length === 0) {
      setStreaming(false);
      activeStreamRef.current = false;
      if (onStreamComplete) {
        onStreamComplete();
      }
      return;
    }

    const next = queueRef.current.shift()!;
    
    // Clear queued status in local state
    next.setMessagesList((prev) =>
      prev.map((msg) =>
        msg.id === next.userMessageId
          ? { ...msg, status: undefined }
          : msg
      )
    );

    // Persist status change in DB
    try {
      const updatedUserMsg: Message = {
        id: next.userMessageId!,
        role: "user",
        content: next.text,
        attachments: next.attachments,
        created_at: new Date().toISOString(),
      };
      await api.updateMessage(conversationId, next.userMessageId!, updatedUserMsg);
    } catch (err) {
      console.error("Failed to update queued message status in DB", err);
    }

    try {
      await runGenerator(
        next.text,
        next.attachments,
        next.rawFiles,
        next.mode,
        next.setMessagesList,
        next.webSearchEnabled,
        next.userMessageId
      );
    } finally {
      await processQueue();
    }
  }, [conversationId, runGenerator, onStreamComplete]);

  const sendMessage = useCallback(
    async (
      text: string,
      attachments: FileAttachment[] = [],
      rawFiles: File[] = [],
      mode: "chat" | "image" | "video" = "chat",
      messagesList: Message[],
      setMessagesList: React.Dispatch<React.SetStateAction<Message[]>>,
      webSearchEnabled: boolean = false
    ) => {
      const userMsgId = `msg_u_${Math.random().toString(36).substring(2, 9)}`;
      const isQueued = activeStreamRef.current;
      const userMessage: Message = {
        id: userMsgId,
        role: "user",
        content: text,
        created_at: new Date().toISOString(),
        attachments,
        status: isQueued ? "queued" : undefined,
      };

      setMessagesList((prev) => [...prev, userMessage]);
      await api.addMessage(conversationId, userMessage);

      if (isQueued) {
        queueRef.current.push({
          text,
          attachments,
          rawFiles,
          mode,
          webSearchEnabled,
          setMessagesList,
          userMessageId: userMsgId,
        });
        return;
      }

      activeStreamRef.current = true;
      setStreaming(true);

      try {
        await runGenerator(text, attachments, rawFiles, mode, setMessagesList, webSearchEnabled, userMsgId);
      } finally {
        await processQueue();
      }
    },
    [conversationId, runGenerator, processQueue]
  );

  const stopGeneration = useCallback(() => {
    api.stopStream();
    activeStreamRef.current = false;
    queueRef.current = [];
    setStreaming(false);
  }, []);

  const regenerateMessage = useCallback(
    async (
      assistantMessageId: string,
      messagesList: Message[],
      setMessagesList: React.Dispatch<React.SetStateAction<Message[]>>,
      webSearchEnabled: boolean = false
    ) => {
      if (activeStreamRef.current) return;

      const assistantIdx = messagesList.findIndex((m) => m.id === assistantMessageId);
      if (assistantIdx === -1) return;

      const userMsg = assistantIdx > 0 && messagesList[assistantIdx - 1].role === "user"
        ? messagesList[assistantIdx - 1]
        : null;
      if (!userMsg) return;

      activeStreamRef.current = true;
      setStreaming(true);

      try {
        await runGenerator(
          userMsg.content,
          userMsg.attachments || [],
          [],
          "chat",
          setMessagesList,
          webSearchEnabled,
          userMsg.id,
          assistantMessageId
        );
      } finally {
        await processQueue();
      }
    },
    [runGenerator, processQueue]
  );

  const editUserMessage = useCallback(
    async (
      userMessageId: string,
      newText: string,
      messagesList: Message[],
      setMessagesList: React.Dispatch<React.SetStateAction<Message[]>>,
      webSearchEnabled: boolean = false
    ) => {
      if (activeStreamRef.current) return;

      const userIdx = messagesList.findIndex((m) => m.id === userMessageId);
      if (userIdx === -1) return;

      setMessagesList((prev) =>
        prev.map((msg) =>
          msg.id === userMessageId
            ? { ...msg, content: newText }
            : msg
        )
      );

      const userMsg = messagesList[userIdx];
      const updatedUserMsg = { ...userMsg, content: newText };
      await api.updateMessage(conversationId, userMessageId, updatedUserMsg);

      const assistantMsg = userIdx + 1 < messagesList.length && messagesList[userIdx + 1].role === "assistant"
        ? messagesList[userIdx + 1]
        : null;

      const assistantMsgId = assistantMsg?.id;

      activeStreamRef.current = true;
      setStreaming(true);

      try {
        await runGenerator(
          newText,
          userMsg.attachments || [],
          [],
          "chat",
          setMessagesList,
          webSearchEnabled,
          userMessageId,
          assistantMsgId
        );
      } finally {
        await processQueue();
      }
    },
    [conversationId, runGenerator, processQueue]
  );

  return {
    sendMessage,
    stopGeneration,
    regenerateMessage,
    editUserMessage,
    streaming,
    providerSwitch,
    setProviderSwitch,
  };
};
