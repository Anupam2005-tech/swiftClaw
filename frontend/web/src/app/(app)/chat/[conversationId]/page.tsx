import React from "react";
import { ChatWindow } from "@/components/chat/ChatWindow";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat Workspace — swiftClaw",
  description: "Unified AI Chat assistant with web search, file grounding, and media generation.",
};

interface ConversationPageProps {
  params: Promise<{ conversationId: string }>;
}

export default async function ConversationPage({ params }: ConversationPageProps) {
  const { conversationId } = await params;

  return <ChatWindow conversationId={conversationId} />;
}
