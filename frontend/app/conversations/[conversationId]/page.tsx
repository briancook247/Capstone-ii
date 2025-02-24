/**
 * Capstone II STG-452
 * Authors: Brian Cook, Dima Bondar, James Green
 * Professor: Bill Hughes
 * Our Own Work
 * License: MIT
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatInput } from "@/components/chat/ChatInput";
import { HistoryNav } from "@/components/HistoryNav";
import { supabase } from "@/lib/supabaseClient";

const SUGGESTED_QUESTIONS = [
  "What is this API framework for?",
  "What authentication methods does this API support?",
  "What are the benefits of this framework?"
];

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ConversationPage() {
  const params = useParams();
  console.log("[ConversationPage] Route params:", params);
  const conversationID = params.conversationID || params.conversationId;
  console.log("[ConversationPage] Using conversationID:", conversationID);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [docId, setDocId] = useState<string | null>(null);
  const [justEnabled, setJustEnabled] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load conversation details to retrieve document id.
  useEffect(() => {
    if (!conversationID) return;
    console.log("[ConversationPage] Fetching conversation details for ID:", conversationID);
    const fetchConversation = async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("id", conversationID)
        .single();
      if (error) {
        console.error("[ConversationPage] Error fetching conversation:", error);
        toast.error("Error loading conversation");
      } else if (data) {
        console.log("[ConversationPage] Conversation data:", data);
        setDocId(data.document_id);
      }
    };
    fetchConversation();
  }, [conversationID]);

  // Load existing messages for this conversation.
  useEffect(() => {
    if (!conversationID) return;
    console.log("[ConversationPage] Fetching messages for conversationID:", conversationID);
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", conversationID)
        .order("created_at", { ascending: true });
      if (error) {
        console.error("[ConversationPage] Error loading messages:", error);
        toast.error("Error loading messages");
      } else if (data) {
        console.log("[ConversationPage] Loaded messages:", data);
        setMessages(
          data.map((m) => ({
            role: m.role,
            content: m.content,
          }))
        );
      }
    };
    fetchMessages();
  }, [conversationID]);

  // Auto-scroll to the latest message.
  useEffect(() => {
    console.log("[ConversationPage] Scrolling to latest message");
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll for document processing status if docId exists.
  useEffect(() => {
    if (!docId) return;
    console.log("[ConversationPage] Starting document processing polling for docId:", docId);
    setIsProcessing(true);
    const intervalId = setInterval(async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/document_status/${docId}`);
        console.log("[ConversationPage] Document status fetch response:", res.status);
        if (res.ok) {
          const status = await res.json();
          console.log("[ConversationPage] Document status:", status);
          const percentage =
            status.total_urls > 0
              ? Math.round((status.processed_urls / status.total_urls) * 100)
              : 0;
          toast.message("Processing Documentation", {
            id: "doc-status",
            duration: Infinity,
            description: (
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Status: {status.status}</span>
                  <span>{percentage}%</span>
                </div>
                <div className="w-full rounded-full h-2" style={{ backgroundColor: "transparent" }}>
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${percentage}%`,
                      background: "linear-gradient(to right, var(--primary-foreground), var(--primary))",
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Processed: {status.processed_urls}/{status.total_urls}</span>
                  <span>Failed: {status.failed_urls}</span>
                </div>
              </div>
            ),
          });

          if (status.status === "completed") {
            console.log("[ConversationPage] Document processing completed");
            clearInterval(intervalId);
            setTimeout(() => {
              toast.success("Documentation processing completed!", { id: "doc-status" });
              setIsProcessing(false);
              setJustEnabled(true);
              setTimeout(() => setJustEnabled(false), 1000);
            }, 1000);
          }
        } else {
          console.error("[ConversationPage] Failed to fetch document status for docId:", docId);
        }
      } catch (error) {
        console.error("[ConversationPage] Error fetching document status:", error);
      }
    }, 2000);

    return () => {
      console.log("[ConversationPage] Clearing document polling interval");
      clearInterval(intervalId);
    };
  }, [docId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[ConversationPage] Sending message:", inputValue);
    if (!inputValue.trim() || isProcessing) {
      toast.error("Please enter a question");
      return;
    }
    const userMessage = inputValue.trim();
    setInputValue("");

    console.log("[ConversationPage] Inserting user message into Supabase");
    const { error: userError } = await supabase.from("chat_messages").insert({
      conversation_id: conversationID,
      role: "user",
      content: userMessage,
    });
    if (userError) {
      console.error("[ConversationPage] Error inserting user message:", userError);
      toast.error("Error sending message");
      return;
    }
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    setIsProcessing(true);
    toast.loading("Generating response...", { id: "chat-response" });
    try {
      console.log("[ConversationPage] Calling /api/chat with query:", userMessage);
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doc_id: docId, query: userMessage, top_k: 3 }),
      });
      console.log("[ConversationPage] /api/chat response status:", res.status);
      const data = await res.json();
      console.log("[ConversationPage] Received chat API data:", data);
      const answer = data.answer;

      console.log("[ConversationPage] Inserting assistant message into Supabase");
      const { error: assistantError } = await supabase.from("chat_messages").insert({
        conversation_id: conversationID,
        role: "assistant",
        content: answer,
      });
      if (assistantError) {
        console.error("[ConversationPage] Error inserting assistant message:", assistantError);
        toast.error("Error saving assistant response");
      }
      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
      toast.success("Response generated!", { id: "chat-response" });
    } catch (error) {
      console.error("[ConversationPage] Error generating response:", error);
      toast.error("Error generating response", { id: "chat-response" });
    }
    setIsProcessing(false);
  };

  return (
    <div className="flex h-screen">
      {/* Conversation History Sidebar */}
      <HistoryNav />

      <div className="flex-1 flex flex-col">
        <ChatHeader
          onNewChat={() => {
            console.log("[ConversationPage] New chat clicked");
            window.location.href = "/";
          }}
        />
        <ChatMessages messages={messages} chatEndRef={chatEndRef} />
        {/* Conditionally render central suggestions when no user message exists */}
        {messages.length <= 1 && (
          <div className="flex flex-col items-center justify-center flex-1">
            <h3 className="text-2xl font-semibold text-muted-foreground mb-4">
              Suggested Questions
            </h3>
            <div className="flex flex-col gap-4 w-full max-w-md">
              {SUGGESTED_QUESTIONS.map((question, index) => (
                <button
                  key={index}
                  onClick={() => {
                    console.log("[ConversationPage] Central suggestion clicked:", question);
                    setInputValue(question);
                  }}
                  className="p-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors duration-200 text-lg"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}
        {/* Once user has sent a message, show smaller prompt bubbles above the input */}
        {messages.length > 1 && (
          <div className="flex gap-2 px-4 py-2 overflow-x-auto">
            {SUGGESTED_QUESTIONS.map((question, index) => (
              <button
                key={index}
                onClick={() => {
                  console.log("[ConversationPage] Small suggestion clicked:", question);
                  setInputValue(question);
                }}
                className="px-3 py-1 rounded-full border border-border bg-card text-sm hover:bg-accent transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        )}
        <ChatInput
          value={inputValue}
          onChange={(e) => {
            console.log("[ConversationPage] Input changed to:", e.target.value);
            setInputValue(e.target.value);
          }}
          onSend={handleSendMessage}
          disabled={isProcessing}
          justEnabled={justEnabled}
        />
      </div>
    </div>
  );
}