/**
 * Capstone II STG-452
 * Authors: Brian Cook, Dima Bondar, James Green
 * Professor: Bill Hughes
 * Our Own Work
 * License: MIT
 *
 *  */


import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { getServerSessionUser } from "@/lib/auth-helpers"; 

// define a helper that returns user.id on the server. 

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json(
        { error: "Missing 'url' in request body." },
        { status: 400 }
      );
    }

    // 1) Identify the user. 
    // For example, a server helper that verifies the JWT from headers/cookies:
    const userId = await getServerSessionUser(); 
    if (!userId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // 2) Create or find the document record for this user & URL
    let { data: existingDocs, error: docError } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", userId)
      .eq("url", url)
      .limit(1);

    if (docError) throw docError;

    let documentId;
    if (existingDocs && existingDocs.length > 0) {
      documentId = existingDocs[0].id;
    } else {
      // Insert new doc
      const { data: newDoc, error: newDocError } = await supabase
        .from("documents")
        .insert({
          user_id: userId,
          url: url,
        })
        .select("*")
        .single();
      if (newDocError) throw newDocError;
      documentId = newDoc.id;
    }

    // 3) Create new conversation referencing this doc + userId
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .insert({
        document_id: documentId,
        user_id: userId,
      })
      .select("*")
      .single();

    if (convError) throw convError;

    // 4) Return the newly created conversation (or just the ID)
    return NextResponse.json({ conversation }, { status: 200 });
  } catch (err: any) {
    console.error("Error creating conversation:", err.message || err);
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
