/**
 * Capstone II STG-452
 * Authors: Brian Cook, Dima Bondar, James Green
 * Professor: Bill Hughes
 * Our Own Work
 * License: MIT
 */

"use client";
import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

export default function LandingPage() {
  const [apiUrl, setApiUrl] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Inform the user to sign in for API ingestion
    alert("Please sign in to ingest API documentation.");
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-3xl space-y-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            API Documentation Assistant
          </h1>
          <p className="text-lg text-muted-foreground">
            Paste your API documentation URL and start a conversation about your API
          </p>
          <form className="w-full mt-8" onSubmit={handleSubmit}>
            <div className="relative flex items-center">
              <input
                type="url"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="Paste your API documentation URL here..."
                className="w-full px-4 py-3 pr-12 text-lg border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button type="submit" className="absolute right-2 p-2 text-muted-foreground hover:text-foreground transition-colors">
                <Search className="w-6 h-6" />
              </button>
            </div>
          </form>
          <div className="pt-8">
            <p className="text-sm text-muted-foreground mb-4">Try these examples:</p>
            <div className="flex flex-wrap justify-center gap-4">
              {["OpenAPI Documentation", "REST API Docs", "GraphQL Schema"].map((example) => (
                <Link key={example} href="#" className="px-4 py-2 text-sm border rounded-full hover:bg-accent transition-colors">
                  {example}
                </Link>
              ))}
            </div>
          </div>
          <div className="pt-8">
            <Link href="/auth/signin" className="text-primary hover:underline">Sign In</Link>
            {" or "}
            <Link href="/auth/signup" className="text-primary hover:underline">Sign Up</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
