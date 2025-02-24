// @/components/chat/ChatInput.tsx
import React from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSend: (e: React.FormEvent) => void;
  disabled: boolean;
}

export function ChatInput({ value, onChange, onSend, disabled }: ChatInputProps) {
  return (
    <div className="border-t border-border p-4">
      <form onSubmit={onSend} className="relative">
        <input
          type="text"
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder="Ask a question about the API..."
          className="block w-full pr-12 pl-4 py-3 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
        />
        <button type="submit" disabled={disabled} className="absolute inset-y-0 right-0 flex items-center px-4 text-primary hover:text-primary/80">
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}