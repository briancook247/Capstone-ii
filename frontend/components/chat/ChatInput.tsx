/**
 * Capstone II STG-452
 * Authors: Brian Cook, Dima Bondar, James Green
 * Professor: Bill Hughes
 * Our Own Work
 * License: MIT
 */

// @/components/ChatInput.tsx (or /components/chat/ChatInput.tsx)
import React from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSend: (e: React.FormEvent) => void;
  disabled: boolean;
  justEnabled?: boolean;
}

export function ChatInput({ value, onChange, onSend, disabled, justEnabled = false }: ChatInputProps) {
  return (
    <div className="border-t border-border p-4">
      <form onSubmit={onSend} className="relative">
        <input
          type="text"
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder="Ask a question about the API..."
          className={`block w-full pr-12 pl-4 py-3 border rounded-lg bg-background transition-all duration-300 
            ${
              disabled
                ? "border-muted-foreground cursor-not-allowed"
                : "border-border focus:ring-2 focus:ring-primary/50 focus:border-primary"
            } 
            ${justEnabled ? "ring-2 ring-green-500/50 border-green-500" : ""}`}
        />
        <button
          type="submit"
          disabled={disabled}
          className={`absolute inset-y-0 right-0 flex items-center px-4 ${
            disabled ? "text-muted-foreground cursor-not-allowed" : "text-primary hover:text-primary/80"
          }`}
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}