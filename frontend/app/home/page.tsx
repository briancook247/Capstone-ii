/**
 * Capstone II STG-452
 * Authors: Brian Cook, Dima Bondar, James Green
 * Professor: Bill Hughes
 * Our Own Work
 * License: MIT
 */

"use client";
import { useState } from "react";
import ChatInput from "@/components/ChatInput";
import ChatWindow from "@/components/ChatWindow";

export default function HomePage() {
  const [documentId, setDocumentId] = useState<number | null>(null);
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([]);
  const [apiUrl, setApiUrl] = useState("");

  const handleIngest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Call the backend ingestion endpoint
    const res = await fetch("/api/ingest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_url: apiUrl }),
    });
    const data = await res.json();
    setDocumentId(data.document_id);
    alert("API documentation ingested. You can now chat about it.");
  };

  const handleSendMessage = async (message: string) => {
    if (!documentId) {
      alert("Please ingest an API documentation URL first.");
      return;
    }
    // Update chat history with the user's message
    setChatHistory((prev) => [...prev, { role: "user", content: message }]);
    // Call the conversation endpoint to get the assistant's reply
    const res = await fetch("/api/conversation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ document_id: documentId, message }),
    });
    const data = await res.json();
    setChatHistory((prev) => [...prev, { role: "assistant", content: data.answer }]);
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto py-10">
        {!documentId && (
          <form onSubmit={handleIngest} className="mb-8">
            <input
              type="url"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="Paste your API documentation URL..."
              className="w-full px-4 py-3 border rounded-lg mb-4"
            />
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded">Ingest Docs</button>
          </form>
        )}
        <ChatWindow chatHistory={chatHistory} />
        <ChatInput onSend={handleSendMessage} />
      </div>
    </main>
  );
}
