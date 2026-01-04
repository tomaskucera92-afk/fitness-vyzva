import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function scriptUrl(): string {
  const url = process.env.SCRIPT_URL;
  if (!url) throw new Error("Missing SCRIPT_URL env variable");
  return url.replace(/\/+$/, "");
}

async function forward(req: NextRequest) {
  const incoming = new URL(req.url);
  const target = new URL(scriptUrl());

  incoming.searchParams.forEach((v, k) => {
    target.searchParams.set(k, v);
  });

  const init: RequestInit = {
    method: req.method,
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    const bodyText = await req.text();
    init.body = bodyText || "{}";
  }

  const res = await fetch(target.toString(), init);
  const text = await res.text();

  return new NextResponse(text, {
    status: res.status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(req: NextRequest) {
  return forward(req);
}

export async function POST(req: NextRequest) {
  return forward(req);
}
