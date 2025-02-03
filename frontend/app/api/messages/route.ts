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

export async function POST(request: Request) {
  try {
    const { conversation_id, role, content } = await request.json();
    if (!conversation_id || !role || !content) {
      return NextResponse.json(
        { error: "Missing conversation_id, role, or content" },
        { status: 400 }
      );
    }

    // 1) Identify the user
    const userId = await getServerSessionUser();
    if (!userId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // 3) Insert the message
    const { error: insertError } = await supabase
      .from("conversation_messages")
      .insert({
        conversation_id,
        role,
        content,
      });

    if (insertError) throw insertError;

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (err: any) {
    console.error("Error inserting message:", err);
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
