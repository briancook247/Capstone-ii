/**
 * Capstone II STG-452
 * Authors: Brian Cook, Dima Bondar, James Green
 * Professor: Bill Hughes
 * Our Own Work
 * License: MIT
 */

"use client";

import { Search, Link } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";

export default function Home() {
  const [apiUrl, setApiUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const { user } = useAuth(); // Retrieve the logged-in user dynamically

  const handleSubmitUrl = async () => {
    console.log("[Home] Submit URL clicked with:", apiUrl);
    if (!apiUrl.trim()) {
      console.error("[Home] URL is empty.");
      toast.error("Please enter an API documentation URL");
      return;
    }

    if (!user) {
      console.error("[Home] No authenticated user.");
      toast.error("You must be logged in to continue.");
      return;
    }

    toast.loading("Initializing documentation analysis...", { id: "init" });
    try {
      const payload = {
        base_url: apiUrl.trim(),
        user_id: user.id, // Send user id to crawl_docs_proxy (if needed for processing)
      };
      console.log("[Home] Payload to crawl_docs_proxy:", payload);

      const res = await fetch("/api/crawl_docs_proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      console.log("[Home] crawl_docs_proxy response status:", res.status);

      if (res.ok) {
        const data = await res.json();
        console.log("[Home] Received data from crawl_docs_proxy:", data);
        const docId = data.doc_id;
        setErrorMsg("");
        toast.dismiss("init");

        // Create a new conversation record in Supabase.
        // Note: The conversations table only accepts document_id and status.
        console.log("[Home] Inserting conversation with docId:", docId);
        const { data: convData, error: convError } = await supabase
          .from("conversations")
          .insert({
            document_id: docId,
            status: "active",
          })
          .select();
        console.log("[Home] Conversation insert result:", { convData, convError });
        if (convError || !convData || convData.length === 0) {
          console.error("[Home] Error creating conversation:", convError);
          toast.error("Error creating conversation");
          return;
        }
        const conversationID = convData[0].id;
        console.log("[Home] New conversation created with ID:", conversationID);

        // Route to the dynamic conversation page.
        router.push(`/conversations/${conversationID}`);
      } else {
        console.error("[Home] crawl_docs_proxy responded with error status.");
        toast.error("Failed to crawl documentation. Please try again.", {
          id: "init",
        });
        setErrorMsg("Failed to crawl documentation. Please try again.");
      }
    } catch (error) {
      console.error("[Home] Error in handleSubmitUrl:", error);
      toast.error("Error calling crawl_docs. Please try again.", { id: "init" });
      setErrorMsg("Error calling crawl_docs. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
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
              value={apiUrl}
              onChange={(e) => {
                console.log("[Home] URL changed to:", e.target.value);
                setApiUrl(e.target.value);
              }}
              placeholder="Enter API documentation URL (e.g., https://api.example.com/docs)"
              className="block w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
            />
            <button
              onClick={handleSubmitUrl}
              className="absolute inset-y-0 right-0 flex items-center px-4 text-sm font-medium text-white bg-primary rounded-r-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
          {errorMsg && (
            <p className="mt-4 text-sm text-red-600 text-center">{errorMsg}</p>
          )}
        </div>
      </div>
    </main>
  );
}