/**
 * Capstone II STG-452
 * Authors: Brian Cook, Dima Bondar, James Green
 * Professor: Bill Hughes
 * Our Own Work
 * 2/01/2025
 * License: MIT
 *
 *  */

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ChatWindow from "@/components/ChatWindow";
import ChatInput from "@/components/ChatInput";

export default function ConversationPage() {
  const { conversationId } = useParams() as { conversationId: string };
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conversationId) return;

    // 1) Fetch all existing messages for this conversation
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("conversation_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
      } else {
        setMessages(data ?? []);
      }
      setLoading(false);
    };

    fetchMessages();

    // 2) Set up real-time subscription for new messages
    const channel = supabase
      .channel(`conversation_messages:conv${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "conversation_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  // Handler for sending a new user message
  const handleSend = async (text: string) => {
    // Insert user message into DB
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversation_id: conversationId,
        role: "user",
        content: text,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      console.error("Error sending message:", data.error);
    } else {
      // Optionally, we can also call an AI endpoint to generate assistant messages
      // For now, we'll rely on the real-time subscription to see new messages if inserted
      // by our server or some other process
    }
  };

  if (loading) {
    return <div>Loading conversation...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-10">
      <ChatWindow messages={messages} />
      <ChatInput onSend={handleSend} />
    </div>
  );
}
