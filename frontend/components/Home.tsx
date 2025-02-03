/**
 * Capstone II STG-452
 * Authors: Brian Cook, Dima Bondar, James Green
 * Professor: Bill Hughes
 * Our Own Work
 * License: MIT
 *
 *  */

"use client";

import { Search, MessageSquare, Send, Link as LinkIcon } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [showChat, setShowChat] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {!showChat ? (
        /* FIRST SCREEN (URL Input) */
        <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
          <div className="text-center mb-12 space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-foreground/90">
              API Documentation Assistant
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Paste your API documentation link below and start a conversation about your API.
            </p>
          </div>

          <div className="w-full max-w-2xl">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LinkIcon className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="url"
                placeholder="Enter API documentation URL (e.g., https://api.example.com/docs)"
                className="block w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background
                           focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
              />
              <button
                onClick={() => setShowChat(true)}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-sm font-medium
                           text-white bg-black rounded-r-lg hover:bg-black/90
                           focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* SECOND SCREEN (Chat UI) */
        <div className="container mx-auto h-screen flex flex-col">
          {/* Chat Header */}
          <div className="border-b border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <MessageSquare className="h-6 w-6 text-primary" />
                <h2 className="text-lg font-semibold">API Documentation Chat</h2>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                New Chat
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* System Message */}
            <div className="flex items-start space-x-4 bg-muted/30 rounded-lg p-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  I&apos;ve analyzed the API documentation. Ask me anything about the API&apos;s endpoints, authentication, or usage examples.
                </p>
              </div>
            </div>
          </div>

          {/* Chat Input */}
          <div className="border-t border-border p-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Ask a question about the API..."
                className="block w-full pr-12 pl-4 py-3 border border-border rounded-lg bg-background
                           focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
              />
              <button className="absolute inset-y-0 right-0 flex items-center px-4 text-primary hover:text-primary/80">
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
