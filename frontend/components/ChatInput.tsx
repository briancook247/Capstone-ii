/**
 * Capstone II STG-452
 * Authors: Brian Cook, Dima Bondar, James Green
 * Professor: Bill Hughes
 * Our Own Work
 * License: MIT
 */

"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface ChatInputProps {
  chatId: string;
  onSend: (message: string) => void;
}

export default function ChatInput({ chatId, onSend }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // 1. Insert new message into Supabase
    try {
      const { error } = await supabase.from("messages").insert({
        chat_id: chatId,
        role: "user",
        content: message.trim(),
      });

      if (error) {
        console.error("Error inserting message:", error);
        return;
      }

      // 2. Optionally, call parent's onSend to do any AI calls, etc.
      onSend(message.trim());

      setMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your question..."
        className="flex-1 px-4 py-2 border rounded-l-lg"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-primary text-white rounded-r-lg"
      >
        Send
      </button>
    </form>
  );
}
