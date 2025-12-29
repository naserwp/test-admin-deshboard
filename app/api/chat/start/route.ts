import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { sendEmail, adminRecipients } from "@/app/lib/email/send";
import { guestLeadTemplate } from "@/app/lib/email/templates";

const RATE_LIMIT = 20;
const WINDOW_MS = 60_000;
const ipHits = new Map<string, { count: number; ts: number }>();

function rateLimited(ip: string) {
  const now = Date.now();
  const entry = ipHits.get(ip);
  if (!entry || now - entry.ts > WINDOW_MS) {
    ipHits.set(ip, { count: 1, ts: now });
    return false;
  }
  if (entry.count >= RATE_LIMIT) return true;
  entry.count += 1;
  return false;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;
  const email = (session?.user as any)?.email ?? null;
  const body = (await req.json().catch(() => null)) || {};
  const visitorName = typeof body?.visitorName === "string" ? body.visitorName.trim() : null;
  const visitorEmail = typeof body?.visitorEmail === "string" ? body.visitorEmail.trim() : null;
  const visitorPhone = typeof body?.visitorPhone === "string" ? body.visitorPhone.trim() : null;
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  try {
    if (!(prisma as any).conversation) {
      console.error("Prisma client missing Conversation model. Run migrations/generate.");
      return NextResponse.json(
        { error: "Conversation model unavailable. Please run prisma generate/migrate." },
        { status: 500 }
      );
    }

    const conversation = await prisma.conversation.create({
      data: {
        userId,
        email: email ?? visitorEmail ?? null,
        visitorName,
        visitorEmail,
        visitorPhone,
        status: "AI_ONLY",
      },
      select: { id: true, status: true, createdAt: true },
    });

    if (!userId && (visitorName || visitorEmail || visitorPhone)) {
      void sendEmail({
        to: adminRecipients(null),
        subject: "New Support Chat Lead",
        html: guestLeadTemplate({
          name: visitorName || "Guest",
          email: visitorEmail || "Not provided",
          phone: visitorPhone || "Not provided",
          conversationId: conversation.id,
          timestamp: new Date().toISOString(),
        }),
      });
    }

    return NextResponse.json({ conversation });
  } catch (error: any) {
    console.error("Create conversation failed:", error);
    return NextResponse.json(
      { error: "Unable to start conversation. Please run migrations and try again." },
      { status: 500 }
    );
  }
}
