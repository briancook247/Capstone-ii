/**
 * Capstone II STG-452
 * Authors: Brian Cook, Dima Bondar, James Green
 * Professor: Bill Hughes
 * Our Own Work
 * License: MIT
 *
 *  */

"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

interface ChatSession {
  id: string;
  title: string | null;
  created_at: string;
}

export default function ChatHistory() {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchChats = async () => {
      const { data, error } = await supabase
        .from("chats")
        .select("id, title, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching chat sessions:", error);
      } else if (data) {
        setChats(data);
      }
      setLoading(false);
    };

    fetchChats();
  }, []);

  if (loading) {
    return <div className="p-4">Loading chat sessions...</div>;
  }

  return (
    <div className="border-r border-gray-200 w-64 p-4 bg-white">
      <h2 className="text-xl font-bold mb-2">My Chats</h2>
      {chats.length === 0 && <p className="text-gray-400">No chats found.</p>}
      <ul>
        {chats.map((chat) => (
          <li key={chat.id} className="mb-2">
            <button
              className="text-blue-600 hover:underline"
              onClick={() => router.push(`/chat/${chat.id}`)}
            >
              {chat.title ?? "Untitled Chat"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
