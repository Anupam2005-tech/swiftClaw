"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Conversation, Message } from "../types/conversation";
import { api } from "../api/client";
import { useRouter } from "next/navigation";

export const useConversations = (activeId?: string) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const router = useRouter();

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const list = await api.listConversations();
      setConversations(list);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (convId: string) => {
    setMessagesLoading(true);
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
      fetchConversations();
    }
  }, [fetchConversations]);

  const activeRef = useRef(activeId);
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (activeId !== activeRef.current) {
      activeRef.current = activeId;
      if (activeId) {
        fetchMessages(activeId);
      } else {
        setMessages([]);
      }
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [activeId, fetchMessages]);

  const createConversation = async (title = "New Conversation"): Promise<string> => {
    try {
      const newConv = await api.createConversation(title);
      await fetchConversations();
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
      await fetchConversations();
      if (activeId === id) {
        router.push("/chat");
      }
    } catch (err) {
      console.error(`Failed to delete conversation ${id}:`, err);
    }
  };

  const batchDeleteConversations = async (ids: string[]) => {
    try {
      await api.batchDeleteConversations(ids);
      await fetchConversations();
      if (activeId && ids.includes(activeId)) {
        router.push("/chat");
      }
    } catch (err) {
      console.error(`Failed to batch delete conversations:`, err);
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
    refreshConversations: fetchConversations,
    refreshMessages: () => activeId && fetchMessages(activeId),
    setMessages,
  };
};
