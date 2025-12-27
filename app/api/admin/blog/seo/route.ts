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

  const prompt = `You are a concise SEO assistant. Given a blog title, current excerpt, and content, return:
- "excerpt": a 20-35 word natural, human-sounding summary optimized for Google
- "metaDescription": a 140-155 character meta description emphasizing clarity and friendliness
- "humanScore": an integer 70-100 estimating human-readability
Reply only in JSON with keys excerpt, metaDescription, humanScore.
Title: ${title}
Current excerpt: ${excerpt}
Content (trimmed): ${content.slice(0, 2500)}`;

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
          { role: "system", content: "You output compact JSON only." },
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
    const raw = data?.choices?.[0]?.message?.content?.trim() || "{}";
    let payload: any = {};
    try {
      payload = JSON.parse(raw);
    } catch {
      payload = {};
    }
    const excerptOut = typeof payload.excerpt === "string" ? payload.excerpt : excerpt;
    const metaOut =
      typeof payload.metaDescription === "string" ? payload.metaDescription : "";
    const humanScore =
      typeof payload.humanScore === "number"
        ? Math.min(100, Math.max(0, Math.round(payload.humanScore)))
        : 90;

    return NextResponse.json({
      excerpt: excerptOut,
      metaDescription: metaOut,
      humanScore,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to generate SEO" }, { status: 500 });
  }
}
