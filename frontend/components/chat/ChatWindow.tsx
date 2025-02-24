/**
 * Capstone II STG-452
 * Authors: Brian Cook, Dima Bondar, James Green
 * Professor: Bill Hughes
 * Our Own Work
 * License: MIT
 */

// @/components/chat/ChatWindow
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