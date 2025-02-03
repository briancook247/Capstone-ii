/**
 * Capstone II STG-452
 * Authors: Brian Cook, Dima Bondar, James Green
 * Professor: Bill Hughes
 * Our Own Work
 * License: MIT
 */

"use client";
interface ChatWindowProps {
  chatHistory: { role: string; content: string }[];
}

export default function ChatWindow({ chatHistory }: ChatWindowProps) {
  return (
    <div className="border p-4 rounded-lg h-96 overflow-y-auto bg-white">
      {chatHistory.map((msg, idx) => (
        <div key={idx} className={`mb-2 ${msg.role === "assistant" ? "text-blue-600" : "text-black"}`}>
          <strong>{msg.role === "assistant" ? "Assistant" : "You"}:</strong> {msg.content}
        </div>
      ))}
    </div>
  );
}
