import React from "react";

interface ChatWindowProps {
  children: React.ReactNode;
}

export default function ChatWindow({ children }: ChatWindowProps) {
  return (
    <div className="container mx-auto h-screen flex flex-col">
      {children}
    </div>
  );
}