import { NextResponse } from "next/server";

export async function POST(request: Request) {
  console.log("[Chat API] Received request");
  const payload = await request.json();
  console.log("[Chat API] Payload:", payload);
  const res = await fetch("http://127.0.0.1:8000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  console.log("[Chat API] Downstream response status:", res.status);

  const contentType = res.headers.get("content-type") || "";
  let data;
  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    data = { error: "Non-JSON response", body: await res.text() };
  }
  console.log("[Chat API] Returning data:", data);
  return NextResponse.json(data, { status: res.status });
}