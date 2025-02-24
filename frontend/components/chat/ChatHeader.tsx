// @/components/chat/ChatHeader.tsx
import React from "react";
import { MessageSquare } from "lucide-react";

interface ChatHeaderProps {
  onNewChat: () => void;
}

export function ChatHeader({ onNewChat }: ChatHeaderProps) {
  console.log("[ChatHeader] Rendered");
  return (
    <div className="border-b border-border p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <MessageSquare className="h-6 w-6 text-primary" />
        <h2 className="text-lg font-semibold">API Documentation Chat</h2>
      </div>
      <button onClick={onNewChat} className="text-sm text-muted-foreground hover:text-foreground">
        New Chat
      </button>
    </div>
  );
}