/**
 * Capstone II STG-452
 * Authors: Brian Cook, Dima Bondar, James Green
 * Professor: Bill Hughes
 * Our Own Work
 * License: MIT
 */

"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface ChatWindowProps {
  chatId: string;
}

interface Message {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

export default function ChatWindow({ chatId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch messages on mount
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .eq("chat_id", chatId)
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Error fetching messages:", error);
        } else if (data) {
          setMessages(data);
        }
      } catch (err) {
        console.error("Error in fetchMessages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Real-time subscription for newly inserted messages
    const channel = supabase
      .channel(`public:messages:chatId=${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setMessages((prev) => [...prev, payload.new as Message]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  if (loading) {
    return <div className="p-4">Loading chat...</div>;
  }

  return (
    <div className="border p-4 rounded-lg h-96 overflow-y-auto bg-white">
      {messages.length === 0 && (
        <div className="text-gray-400 text-center">No messages yet.</div>
      )}
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`mb-2 ${
            msg.role === "assistant" ? "text-blue-600" : "text-black"
          }`}
        >
          <strong>{msg.role === "assistant" ? "Assistant" : "You"}:</strong>{" "}
          {msg.content}
        </div>
      ))}
    </div>
  );
}
