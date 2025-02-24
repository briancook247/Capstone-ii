"use client";

import { Search, Link, MessageSquare, Send } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

type DocumentStatus = {
  id: string;
  status: "in_progress" | "completed" | "failed";
  total_urls: number;
  processed_urls: number;
  failed_urls: number;
};

type Message = {
  role: "user" | "assistant";
  content: string;
};

const SUGGESTED_QUESTIONS = [
  "What authentication methods does this API support?",
  "Can you explain the rate limiting policy?",
  "What are the available endpoints for user management?"
];

export default function Home() {
  console.log("[Home] Component rendered");
  const [showChat, setShowChat] = useState(false);
  const [apiUrl, setApiUrl] = useState("");
  const [docId, setDocId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [justEnabled, setJustEnabled] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const prevProcessingRef = useRef(isProcessing);

  // Scroll to latest message when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Green flash effect when processing completes
  useEffect(() => {
    if (prevProcessingRef.current && !isProcessing) {
      setJustEnabled(true);
      setTimeout(() => setJustEnabled(false), 1000);
    }
    prevProcessingRef.current = isProcessing;
  }, [isProcessing]);

  // Polling for document processing status simulation
  useEffect(() => {
    if (!docId) return;
    setIsProcessing(true);
    let processedUrls = 0;
    const totalUrls = 50;
    const intervalId = setInterval(() => {
      processedUrls += 2;
      const status: DocumentStatus = {
        id: docId,
        status: processedUrls >= totalUrls ? "completed" : "in_progress",
        total_urls: totalUrls,
        processed_urls: Math.min(processedUrls, totalUrls),
        failed_urls: Math.floor(Math.random() * 3),
      };

      toast.message("Processing Documentation", {
        id: "doc-status",
        duration: Infinity,
        description: (
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-sm">
              <span>Status: {status.status}</span>
              <span>
                {Math.round((status.processed_urls / status.total_urls) * 100)}%
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(status.processed_urls / status.total_urls) * 100}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                Processed: {status.processed_urls}/{status.total_urls}
              </span>
              <span>Failed: {status.failed_urls}</span>
            </div>
          </div>
        ),
      });

      if (processedUrls >= totalUrls) {
        clearInterval(intervalId);
        setTimeout(() => {
          toast.success("Documentation processing completed!", {
            id: "doc-status",
          });
          setIsProcessing(false);
        }, 1000);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [docId]);

  // Handle submission of the API documentation URL
  const handleSubmitUrl = async () => {
    console.log("[handleSubmitUrl] URL submitted:", apiUrl);
    if (!apiUrl.trim()) {
      console.error("[handleSubmitUrl] URL is empty");
      toast.error("Please enter an API documentation URL");
      return;
    }

    toast.loading("Initializing documentation analysis...");
    setShowChat(true);

    try {
      const payload = {
        base_url: apiUrl.trim(),
        // Simulated user id
        user_id: "12c4b02f-39b9-4efe-9f8a-9bef2ed35f0b",
      };
      console.log("[handleSubmitUrl] Payload:", payload);

      const res = await fetch("/api/crawl_docs_proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        console.info("[handleSubmitUrl] Received docId:", data.doc_id);
        setDocId(data.doc_id);
        setErrorMsg("");
        toast.dismiss();
        // Initialize with a welcome message from the assistant
        setMessages([
          {
            role: "assistant",
            content:
              "Hello! I'm analyzing the API documentation you provided. Please wait while I process it.",
          },
        ]);
      } else {
        console.error("[handleSubmitUrl] Response not OK");
        toast.error("Failed to crawl documentation. Please try again.");
        setErrorMsg("Failed to crawl documentation. Please try again.");
      }
    } catch (error) {
      console.error("[handleSubmitUrl] Error during fetch:", error);
      toast.error("Error calling crawl_docs. Please try again.");
      setErrorMsg("Error calling crawl_docs. Please try again.");
    }
  };

  // Simulated streaming of the assistant response
  const simulateStreamingResponse = async (message: string) => {
    const words = message.split(" ");
    let currentContent = "";
    // Add a new assistant message with empty content
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    for (const word of words) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      currentContent += word + " ";
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].content = currentContent;
        return newMessages;
      });
    }
  };

  // Handle sending a user message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isProcessing) {
      toast.error("Please enter a question");
      return;
    }

    const userMessage = inputValue.trim();
    setInputValue("");
    setShowSuggestions(false);

    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    toast.loading("Generating response...", { id: "chat-response" });
    // Simulate a streaming API response
    const response =
      "Based on the API documentation, I can help you with that query. The response is being generated in a streaming fashion to simulate a real-time chat experience.";
    await simulateStreamingResponse(response);
    toast.success("Response generated!", { id: "chat-response" });
  };

  // Handle clicking a suggested question
  const handleSuggestedQuestion = async (question: string) => {
    if (isProcessing) return;
    setInputValue(question);
    setShowSuggestions(false);
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    await handleSendMessage(fakeEvent);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      {!showChat ? (
        <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
          <div className="text-center mb-12 space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-foreground/90">
              API Documentation Assistant
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Paste your API documentation link below and start a conversation
              about your API.
            </p>
          </div>

          <div className="w-full max-w-2xl">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Link className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="url"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="Enter API documentation URL (e.g., https://api.example.com/docs)"
                className="block w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
              />
              <button
                onClick={handleSubmitUrl}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-sm font-medium text-white bg-primary rounded-r-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
            {errorMsg && (
              <p className="mt-4 text-sm text-red-600 text-center">{errorMsg}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="container mx-auto h-screen flex flex-col">
          {/* Chat Header */}
          <div className="border-b border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <MessageSquare className="h-6 w-6 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">
                  API Documentation Chat
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowChat(false);
                  setApiUrl("");
                  setDocId(null);
                  setMessages([]);
                  setIsProcessing(false);
                  setShowSuggestions(true);
                  toast.info("Started a new chat session");
                }}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                New Chat
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start space-x-4 ${
                  message.role === "assistant" ? "bg-muted/30" : ""
                } rounded-lg p-4`}
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
            {showSuggestions &&
              !isProcessing &&
              messages.length <= 1 && (
                <div className="flex flex-col items-center space-y-4 py-8">
                  <h3 className="text-lg font-medium text-muted-foreground">
                    Suggested Questions
                  </h3>
                  <div className="flex flex-col gap-3 w-full max-w-md">
                    {SUGGESTED_QUESTIONS.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestedQuestion(question)}
                        className="text-left p-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors duration-200"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="border-t border-border p-4">
            <form onSubmit={handleSendMessage} className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isProcessing}
                placeholder={
                  isProcessing
                    ? "Please wait while the documentation is being processed..."
                    : "Ask a question about the API..."
                }
                className={`block w-full pr-12 pl-4 py-3 border rounded-lg bg-background transition-all duration-300 
                  ${
                    isProcessing
                      ? "border-muted-foreground cursor-not-allowed"
                      : "border-border focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  } 
                  ${justEnabled ? "ring-2 ring-green-500/50 border-green-500" : ""}`}
              />
              <button
                type="submit"
                disabled={isProcessing}
                className={`absolute inset-y-0 right-0 flex items-center px-4 ${
                  isProcessing
                    ? "text-muted-foreground cursor-not-allowed"
                    : "text-primary hover:text-primary/80"
                }`}
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}