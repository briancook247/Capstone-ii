/**
 * Capstone II STG-452
 * Authors: Brian Cook, Dima Bondar, James Green
 * Professor: Bill Hughes
 * Our Own Work
 * License: MIT
 */

// @/components/HistoryNav.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

export function HistoryNav() {
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    console.log("[HistoryNav] Fetching conversation history");
    const fetchConversations = async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("[HistoryNav] Error fetching conversations:", error);
        toast.error("Error loading conversation history");
      } else if (data) {
        console.log("[HistoryNav] Conversation history:", data);
        setConversations(data);
      }
    };

    fetchConversations();
  }, []);

  return (
    <div className="w-64 border-r border-border p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">History</h2>
      <ul>
        {conversations.map((conv) => (
          <li key={conv.id} className="mb-2">
            <Link
              href={`/conversations/${conv.id}`}
              className="text-sm text-primary hover:underline"
            >
              Conversation {conv.id.substring(0, 8)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}