// app/api/crawl_docs_proxy/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const payload = await request.json();
  const res = await fetch("http://127.0.0.1:8000/crawl_docs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  // Check if response is JSON; if not, get the text.
  const contentType = res.headers.get("content-type") || "";
  let data;
  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    data = { error: "Non-JSON response", body: await res.text() };
  }

  return NextResponse.json(data, { status: res.status });
}