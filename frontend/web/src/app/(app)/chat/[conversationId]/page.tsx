import { ChatWindow } from "@/components/chat/ChatWindow";

interface ConversationPageProps {
  params: Promise<{ conversationId: string }>;
}

export default async function ConversationPage({ params }: ConversationPageProps) {
  const { conversationId } = await params;

  return <ChatWindow conversationId={conversationId} />;
}
