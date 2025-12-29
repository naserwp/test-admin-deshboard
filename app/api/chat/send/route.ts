import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { chatWithOpenAI } from "@/app/lib/openai/chat";
import { publish } from "@/app/lib/realtime/bus";
import { logError } from "@/app/lib/log";

const RATE_LIMIT = 30;
const WINDOW_MS = 60_000;
const ipHits = new Map<string, { count: number; ts: number }>();
const convoHits = new Map<string, { count: number; ts: number }>();
const lastSendByConversation = new Map<string, number>();
const FALLBACK_COOLDOWN_MS = 5 * 60 * 1000;
const FALLBACK_PROMPT = [
  "Sorry for the delay. To help our team, please share:",
  "- Your full name",
  "- Business name",
  "- Issue category",
  "- Urgency",
  "- Best email/phone",
  "- Best time to reach you",
  "",
  "An admin will review and respond soon.",
].join("\n");

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
  const body = await req.json().catch(() => null);
  if (!body?.conversationId || !body?.message) {
    return NextResponse.json({ error: "conversationId and message are required" }, { status: 400 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: String(body.conversationId) },
    select: { id: true, userId: true, status: true, metadata: true },
  });
  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (conversation.userId && userId && conversation.userId !== userId && session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = Date.now();
  const convoEntry = convoHits.get(conversation.id);
  if (!convoEntry || now - convoEntry.ts > WINDOW_MS) {
    convoHits.set(conversation.id, { count: 1, ts: now });
  } else {
    if (convoEntry.count >= RATE_LIMIT) {
      return NextResponse.json({ error: "Conversation rate limited" }, { status: 429 });
    }
    convoEntry.count += 1;
  }

  const lastSend = lastSendByConversation.get(conversation.id) || 0;
  if (now - lastSend < 1500) {
    return NextResponse.json({ error: "Slow down" }, { status: 429 });
  }
  lastSendByConversation.set(conversation.id, now);

  const hasAdminMessage = await prisma.message.findFirst({
    where: { conversationId: conversation.id, role: "ADMIN" },
    select: { id: true },
  });

  const userMessage = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      sender: "USER",
      role: "USER",
      content: String(body.message),
      metadata: { ip, email },
    },
  });
  const updatedMetadata = { ...(conversation.metadata as any) };
  if (conversation.status === "REQUESTED_HUMAN") {
    try {
      const text = String(body.message);
      updatedMetadata.leadNotes = text;
      updatedMetadata.fullName = updatedMetadata.fullName ?? (text.match(/name[:\-]?\s*([^\n]+)/i)?.[1]?.trim() ?? null);
      updatedMetadata.businessName =
        updatedMetadata.businessName ?? (text.match(/business[:\-]?\s*([^\n]+)/i)?.[1]?.trim() ?? null);
      updatedMetadata.issueCategory =
        updatedMetadata.issueCategory ?? (text.match(/issue[:\-]?\s*([^\n]+)/i)?.[1]?.trim() ?? null);
      updatedMetadata.urgency = updatedMetadata.urgency ?? (text.match(/urgency[:\-]?\s*([^\n]+)/i)?.[1]?.trim() ?? null);
      updatedMetadata.bestEmailPhone =
        updatedMetadata.bestEmailPhone ?? (text.match(/(email|phone)[:\-]?\s*([^\n]+)/i)?.[2]?.trim() ?? null);
      updatedMetadata.bestTime =
        updatedMetadata.bestTime ?? (text.match(/time[:\-]?\s*([^\n]+)/i)?.[1]?.trim() ?? null);
    } catch (error) {
      logError("chat.metadata_parse_failed", error, { conversationId: conversation.id });
    }
  }

  // If HUMAN_ACTIVE, skip AI replies; only record user message.
  let assistantMessage: any = null;
  if (conversation.status !== "HUMAN_ACTIVE") {
    try {
      const history = await prisma.message.findMany({
        where: { conversationId: conversation.id },
        orderBy: { createdAt: "asc" },
        select: { role: true, content: true },
      });

      const aiContent = await chatWithOpenAI(
        history.map((m) => ({
          role:
            m.role === "ASSISTANT"
              ? "assistant"
              : m.role === "SYSTEM"
              ? "system"
              : m.role === "ADMIN"
              ? "assistant"
              : "user",
          content: m.content,
        }))
      );

      assistantMessage = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          sender: "AI",
          role: "ASSISTANT",
          content: aiContent,
          metadata: {},
        },
      });
    } catch (error) {
      logError("chat.ai_reply_failed", error, { conversationId: conversation.id });
    }
  }

  // persist metadata/lastMessageAt if captured
  try {
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        metadata: Object.keys(updatedMetadata).length ? updatedMetadata : conversation.metadata,
        lastMessageAt: new Date(),
      },
    });
  } catch (error) {
    logError("chat.metadata_update_failed", error, { conversationId: conversation.id });
  }

  // Fallback lead collection when waiting for human support (cooldown guarded)
  let fallbackMessage: any = null;
  if (conversation.status === "REQUESTED_HUMAN" && !hasAdminMessage) {
    const lastFallback = await prisma.message.findFirst({
      where: {
        conversationId: conversation.id,
        metadata: {
          path: ["fallback"],
          equals: "delay_response",
        },
      },
      orderBy: { createdAt: "desc" },
      select: { id: true, createdAt: true },
    });

    const nowMs = Date.now();
    const lastFallbackMs = lastFallback ? new Date(lastFallback.createdAt).getTime() : 0;
    const cooldownExpired = !lastFallback || nowMs - lastFallbackMs > FALLBACK_COOLDOWN_MS;

    if (cooldownExpired) {
      const content = FALLBACK_PROMPT;
      fallbackMessage = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          sender: "AI",
          role: "ASSISTANT",
          content,
          metadata: { fallback: "delay_response" },
        },
      });
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { lastMessageAt: new Date(), metadata: updatedMetadata },
      });
    }
  }

  let nextStatus = conversation.status;
  const humanRequested = /human/i.test(body.message);
  if (humanRequested) {
    nextStatus = "REQUESTED_HUMAN";
  }

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: {
      status: nextStatus,
      lastMessageAt: new Date(),
    },
  });

  // Notify admin if human help requested
  if (humanRequested) {
    const { sendEmail, adminRecipients } = await import("@/app/lib/email/send");
    const { conversationRequestedHumanTemplate } = await import("@/app/lib/email/templates");
    const preview = body.message.slice(0, 160);
    void sendEmail({
      to: adminRecipients(email),
      subject: `Conversation needs human attention (${conversation.id})`,
      html: conversationRequestedHumanTemplate(conversation.id, preview),
    });
  }

  return NextResponse.json({
    messages: [
      { id: userMessage.id, role: "user", content: userMessage.content, createdAt: userMessage.createdAt },
      ...(assistantMessage
        ? [
            {
              id: assistantMessage.id,
              role: "assistant",
              content: assistantMessage.content,
              createdAt: assistantMessage.createdAt,
            },
          ]
        : []),
      ...(fallbackMessage
        ? [
            {
              id: fallbackMessage.id,
              role: "assistant",
              content: fallbackMessage.content,
              createdAt: fallbackMessage.createdAt,
            },
          ]
        : []),
      ...(fallbackMessage
        ? [
            {
              id: fallbackMessage.id,
              role: "assistant",
              content: fallbackMessage.content,
              createdAt: fallbackMessage.createdAt,
            },
          ]
        : []),
    ],
  });

  // Realtime broadcast
  publish({
    type: "message:new",
    conversationId: conversation.id,
    payload: {
      messages: [
        { id: userMessage.id, role: "user", content: userMessage.content, createdAt: userMessage.createdAt },
        ...(assistantMessage
          ? [{ id: assistantMessage.id, role: "assistant", content: assistantMessage.content, createdAt: assistantMessage.createdAt }]
          : []),
        ...(fallbackMessage
          ? [{ id: fallbackMessage.id, role: "assistant", content: fallbackMessage.content, createdAt: fallbackMessage.createdAt }]
          : []),
      ],
    },
  });
}
