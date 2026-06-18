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

  const sendMessage = useCallback(
    async (
      text: string,
      attachments: FileAttachment[] = [],
      mode: "chat" | "image" | "video" = "chat",
      messagesList: Message[],
      setMessagesList: React.Dispatch<React.SetStateAction<Message[]>>
    ) => {
      if (streaming) return;

      setStreaming(true);
      activeStreamRef.current = true;
      setProviderSwitch(null);

      // 1. Create and add User Message to UI & Mock database
      const userMsgId = `msg_u_${Math.random().toString(36).substring(2, 9)}`;
      const userMessage: Message = {
        id: userMsgId,
        role: "user",
        content: text,
        created_at: new Date().toISOString(),
        attachments,
      };

      setMessagesList((prev) => [...prev, userMessage]);
      await api.addMessage(conversationId, userMessage);

      // 2. Create and add Assistant Message to UI (status: streaming)
      const assistantMsgId = `msg_a_${Math.random().toString(36).substring(2, 9)}`;
      const assistantMessage: Message = {
        id: assistantMsgId,
        role: "assistant",
        content: "",
        created_at: new Date().toISOString(),
        status: "streaming",
        tool_calls: [],
      };

      setMessagesList((prev) => [...prev, assistantMessage]);

      let currentText = "";
      let currentToolCalls: ToolCall[] = [];
      let lastEvent: SSEEvent | null = null;

      try {
        const stream = api.sendChatMessage(conversationId, text, attachments, mode);

        for await (const event of stream) {
          if (!activeStreamRef.current) {
            // Stream stopped by user
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
              // Show low confidence banner below message
              setMessagesList((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMsgId
                    ? {
                        ...msg,
                        sources: msg.sources || [], // keep sources if any
                        content: msg.content, // keep content
                        // tag low confidence
                        status: "done", // mark done
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
              // final update
              setMessagesList((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMsgId
                    ? {
                        ...msg,
                        status: "done",
                        tokens_used: event.tokens_used,
                      }
                    : msg
                )
              );
              break;

            case "error":
              if (event.code === "invalid_key") {
                toast({
                  title: "Invalid API Key",
                  description: `Your ${event.message || "API key"} was rejected. Update it in Settings to continue using this provider.`,
                  variant: "destructive",
                  duration: 8000,
                  position: "top-right",
                });
              }
              setMessagesList((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMsgId
                    ? {
                        ...msg,
                        status: "error",
                        content: msg.content + `\n\n**Error (${event.code}):** ${event.message}`,
                      }
                    : msg
                )
              );
              break;
          }
        }

        // 3. Save final state to Database
        const finalMessages = await api.getMessages(conversationId);
        // Look for the current assistant message
        const finalAssistantMsg = {
          id: assistantMsgId,
          role: "assistant" as const,
          content: currentText,
          tool_calls: currentToolCalls,
          status: activeStreamRef.current ? ("done" as const) : ("interrupted" as const),
          provider: lastEvent?.type === "provider_switch" ? (lastEvent.to as any) : undefined,
        } as Message;

        // Yield additional details if RAG was requested to demonstrate v1.2 RAG
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
          // Find the active job ID created
          const match = lastEvent?.type === "media_job_started" ? lastEvent.job_id : "";
          finalAssistantMsg.media_job_id = match;
          finalAssistantMsg.status = "done";
        }

        // Add to database
        await api.addMessage(conversationId, finalAssistantMsg);
      } catch (err) {
        console.error("Streaming error:", err);
        setMessagesList((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  status: "error",
                  content: msg.content + "\n\n**Connection Error:** Stream disconnected unexpectedly.",
                }
              : msg
          )
        );
      } finally {
        setStreaming(false);
        activeStreamRef.current = false;
        if (onStreamComplete) {
          onStreamComplete();
        }
      }
    },
    [conversationId, streaming, onStreamComplete]
  );

  const stopGeneration = useCallback(() => {
    api.stopStream();
    activeStreamRef.current = false;
    setStreaming(false);
  }, []);

  const regenerateMessage = useCallback(
    async (
      messagesList: Message[],
      setMessagesList: React.Dispatch<React.SetStateAction<Message[]>>
    ) => {
      // Find the last user message
      const userMessages = messagesList.filter((m) => m.role === "user");
      if (userMessages.length === 0) return;

      const lastUserMessage = userMessages[userMessages.length - 1];

      // Remove the last assistant message if it was interrupted/errored
      setMessagesList((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === "assistant") {
          return prev.slice(0, -1);
        }
        return prev;
      });

      // Send again
      await sendMessage(
        lastUserMessage.content,
        lastUserMessage.attachments,
        "chat",
        messagesList.slice(0, -1),
        setMessagesList
      );
    },
    [sendMessage]
  );

  return {
    sendMessage,
    stopGeneration,
    regenerateMessage,
    streaming,
    providerSwitch,
    setProviderSwitch,
  };
};
