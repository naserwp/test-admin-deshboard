import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";

export const runtime = "nodejs";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const title = body?.title ?? "";
  const excerpt = body?.excerpt ?? "";
  const content = body?.content ?? "";

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 500 });
  }

  const prompt = `You are a concise blog structuring assistant. Given a post title, excerpt, and content, return a short table of contents of 3-6 headings that capture the structure. Prefer H2-level names (no numbering, no Markdown symbols). Reply ONLY with a JSON array of strings.
Title: ${title}
Excerpt: ${excerpt}
Content (trimmed): ${content.slice(0, 3000)}`;

  try {
    const res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You output clean JSON arrays only." },
          { role: "user", content: prompt },
        ],
        max_tokens: 200,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: `OpenAI error: ${text}` }, { status: 500 });
    }
    const data = await res.json();
    const raw = data?.choices?.[0]?.message?.content?.trim() || "[]";
    let toc: string[] = [];
    try {
      toc = JSON.parse(raw);
    } catch {
      toc = raw
        .replace(/^\[/, "")
        .replace(/\]$/, "")
        .split(",")
        .map((s: string) => s.replace(/["']/g, "").trim())
        .filter(Boolean);
    }

    if (!Array.isArray(toc) || toc.length === 0) {
      return NextResponse.json({ error: "No TOC generated" }, { status: 500 });
    }

    return NextResponse.json({ toc });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to generate TOC" }, { status: 500 });
  }
}
