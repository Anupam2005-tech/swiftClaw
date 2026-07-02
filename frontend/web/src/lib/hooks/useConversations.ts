"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Conversation, Message } from "../types/conversation";
import { api } from "../api/client";
import { useRouter } from "next/navigation";

export const useConversations = (activeId?: string) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const router = useRouter();

  const fetchConversations = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setLoading(true);
    }
    try {
      const list = await api.listConversations();
      setConversations(list);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (convId: string, isInitial = false) => {
    if (isInitial) {
      setMessagesLoading(true);
    }
    try {
      const history = await api.getMessages(convId);
      setMessages(history);
    } catch (err) {
      console.error(`Failed to load messages for ${convId}:`, err);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      fetchConversations(true);
    }
  }, [fetchConversations]);

  useEffect(() => {
    if (activeId) {
      fetchMessages(activeId, true);
    } else {
      setMessages([]);
    }
  }, [activeId, fetchMessages]);

  const createConversation = async (title = "New Conversation"): Promise<string> => {
    try {
      const newConv = await api.createConversation(title);
      await fetchConversations(false);
      router.push(`/chat/${newConv.id}`);
      return newConv.id;
    } catch (err) {
      console.error("Failed to create conversation:", err);
      throw err;
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      await api.deleteConversation(id);
      await fetchConversations(false);
      window.dispatchEvent(new CustomEvent("conversations-updated"));
      if (activeId === id) {
        router.push("/chat");
      }
    } catch (err) {
      console.error(`Failed to delete conversation ${id}:`, err);
    }
  };

  const batchDeleteConversations = async (ids: string[]) => {
    try {
      if (ids.length > 0) {
        await api.batchDeleteConversations(ids);
      }
      await fetchConversations(false);
      window.dispatchEvent(new CustomEvent("conversations-updated"));
      if (activeId && ids.includes(activeId)) {
        router.push("/chat");
      }
    } catch (err) {
      console.error(`Failed to batch delete conversations:`, err);
    }
  };

  const pinConversation = async (id: string, pinned: boolean) => {
    try {
      await api.pinConversation(id, pinned);
      await fetchConversations(false);
      window.dispatchEvent(new CustomEvent("conversations-updated"));
    } catch (err) {
      console.error(`Failed to pin conversation ${id}:`, err);
    }
  };

  return {
    conversations,
    loading,
    messages,
    messagesLoading,
    createConversation,
    deleteConversation,
    batchDeleteConversations,
    pinConversation,
    refreshConversations: () => fetchConversations(false),
    refreshMessages: useCallback(() => activeId && fetchMessages(activeId, false), [activeId, fetchMessages]),
    setMessages,
  };
};
