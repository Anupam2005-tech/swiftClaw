"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import { Spinner } from "@/components/ui/spinner";

export default function NewChatPage() {
  const router = useRouter();

  useEffect(() => {
    const initChat = async () => {
      try {
        const newConv = await api.createConversation();
        router.replace(`/chat/${newConv.id}`);
      } catch (err) {
        console.error("Failed to provision new chat workspace:", err);
      }
    };
    initChat();
  }, [router]);

  return (
    <div className="flex-1 flex items-center justify-center bg-sc-canvas">
      <Spinner size="md" className="border-t-transparent border-sc-text/40" />
    </div>
  );
}
