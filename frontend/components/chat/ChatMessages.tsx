/**
 * Capstone II STG-452
 * Authors: Brian Cook, Dima Bondar, James Green
 * Professor: Bill Hughes
 * Our Own Work
 * License: MIT
 */

// @/components/chat/ChatMessages.tsx
import React from "react";
import { MessageSquare } from "lucide-react";

interface ChatMessagesProps {
  messages: { role: string; content: string }[];
  chatEndRef: React.RefObject<HTMLDivElement>;
}

export function ChatMessages({ messages, chatEndRef }: ChatMessagesProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex items-start space-x-4 rounded-lg p-4 ${
            message.role === "assistant" ? "flex-row" : "flex-row-reverse"
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-primary" />
          </div>
          <div
            className={`flex-1 p-2 rounded-lg ${
              message.role === "assistant"
                ? "bg-muted/30 text-left"
                : "bg-primary/10 text-right"
            }`}
          >
            <p className="text-sm">{message.content}</p>
          </div>
        </div>
      ))}
      <div ref={chatEndRef} />
    </div>
  );
}