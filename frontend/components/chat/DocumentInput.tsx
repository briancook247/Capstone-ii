/**
 * Capstone II STG-452
 * Authors: Brian Cook, Dima Bondar, James Green
 * Professor: Bill Hughes
 * Our Own Work
 * License: MIT
 */

"use client";

import { useState } from "react";
import { Link, Search } from "lucide-react";

interface DocumentInputProps {
  onDocumentSubmit: (url: string) => void;
}

export default function DocumentInput({ onDocumentSubmit }: DocumentInputProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = () => {
    if (url.trim()) {
      onDocumentSubmit(url);
    }
  };

  return (
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
            <Link className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter API documentation URL (e.g., https://api.example.com/docs)"
            className="block w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
          />
          <button
            onClick={handleSubmit}
            className="absolute inset-y-0 right-0 flex items-center px-4 text-sm font-medium text-white bg-primary rounded-r-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}