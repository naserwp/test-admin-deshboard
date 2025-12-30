import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { chatWithOpenAI } from "@/app/lib/openai/chat";
import { publish } from "@/app/lib/realtime/bus";
import { logError } from "@/app/lib/log";

export const runtime = "nodejs"; // Prisma-safe on Vercel/serverless

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

function getClientIp(req: Request) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function mapRoleToOpenAI(role: string): "user" | "assistant" | "system" {
  // Treat ADMIN as assistant for the model context
  if (role === "ASSISTANT" || role === "ADMIN") return "assistant";
  if (role === "SYSTEM") return "system";
  return "user";
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;
  const sessionEmail = (session?.user as any)?.email ?? null;
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  const body = await req.json().catch(() => null);
  const conversationId = body?.conversationId ? String(body.conversationId) : null;
  const messageText = typeof body?.message === "string" ? body.message.trim() : "";

  if (!conversationId || !messageText) {
    return NextResponse.json(
      { error: "conversationId and message are required" },
      { status: 400 }
    );
  }

  // Per-conversation rate limit
  const now = Date.now();
  const convoEntry = convoHits.get(conversationId);
  if (!convoEntry || now - convoEntry.ts > WINDOW_MS) {
    convoHits.set(conversationId, { count: 1, ts: now });
  } else {
    if (convoEntry.count >= RATE_LIMIT) {
      return NextResponse.json({ error: "Conversation rate limited" }, { status: 429 });
    }
    convoEntry.count += 1;
  }

  // Simple spam guard
  const lastSend = lastSendByConversation.get(conversationId) || 0;
  if (now - lastSend < 1500) {
    return NextResponse.json({ error: "Slow down" }, { status: 429 });
  }
  lastSendByConversation.set(conversationId, now);

  // Fetch conversation (guard null)
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { id: true, userId: true, status: true, metadata: true },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }
const convoId = conversation.id;

  // AuthZ: allow admin; allow owner; allow guest conversation when conversation.userId is null
  if (conversation.userId && userId && conversation.userId !== userId && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Detect human request early (so status can update consistently)
  const humanRequested = /\b(human|live\s*support|agent|representative)\b/i.test(messageText);

  // Check if any admin message exists (used for fallback)
  const hasAdminMessage = await prisma.message.findFirst({
    where: { conversationId: conversation.id, role: "ADMIN" },
    select: { id: true },
  });

  // Save user message
  const userMessage = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      sender: "USER",
      role: "USER",
      content: messageText,
      metadata: { ip, email: sessionEmail },
    },
  });

  // Metadata capture (lead collection)
  const updatedMetadata = { ...(conversation.metadata as any) };

  if (conversation.status === "REQUESTED_HUMAN") {
    try {
      updatedMetadata.leadNotes = messageText;
      updatedMetadata.fullName =
        updatedMetadata.fullName ??
        (messageText.match(/name[:\-]?\s*([^\n]+)/i)?.[1]?.trim() ?? null);
      updatedMetadata.businessName =
        updatedMetadata.businessName ??
        (messageText.match(/business[:\-]?\s*([^\n]+)/i)?.[1]?.trim() ?? null);
      updatedMetadata.issueCategory =
        updatedMetadata.issueCategory ??
        (messageText.match(/issue[:\-]?\s*([^\n]+)/i)?.[1]?.trim() ?? null);
      updatedMetadata.urgency =
        updatedMetadata.urgency ??
        (messageText.match(/urgency[:\-]?\s*([^\n]+)/i)?.[1]?.trim() ?? null);
      updatedMetadata.bestEmailPhone =
        updatedMetadata.bestEmailPhone ??
        (messageText.match(/(email|phone)[:\-]?\s*([^\n]+)/i)?.[2]?.trim() ?? null);
      updatedMetadata.bestTime =
        updatedMetadata.bestTime ??
        (messageText.match(/time[:\-]?\s*([^\n]+)/i)?.[1]?.trim() ?? null);
    } catch (error) {
      logError("chat.metadata_parse_failed", error, { conversationId: conversation.id });
    }
  }

  // Decide next status (single update later)
  let nextStatus = conversation.status;
  if (humanRequested && conversation.status !== "HUMAN_ACTIVE") {
    nextStatus = "REQUESTED_HUMAN";
  }

  // AI response (skip if HUMAN_ACTIVE)
  let assistantMessage: { id: string; content: string; createdAt: Date } | null = null;

  if (nextStatus !== "HUMAN_ACTIVE") {
    try {
      const history = await prisma.message.findMany({
        where: { conversationId: conversation.id },
        orderBy: { createdAt: "asc" },
        select: { role: true, content: true },
        take: 30, // prevent huge prompt
      });

      const aiContent = await chatWithOpenAI(
        history.map((m) => ({
          role: mapRoleToOpenAI(m.role),
          content: m.content,
        }))
      );

      const created = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          sender: "AI",
          role: "ASSISTANT",
          content: aiContent,
          metadata: {},
        },
        select: { id: true, content: true, createdAt: true },
      });

      assistantMessage = created;
    } catch (error) {
      logError("chat.ai_reply_failed", error, { conversationId: conversation.id });
    }
  }

  // Fallback lead collection when waiting for human (cooldown guarded)
  let fallbackMessage: { id: string; content: string; createdAt: Date } | null = null;

  if (nextStatus === "REQUESTED_HUMAN" && !hasAdminMessage) {
    try {
      const lastFallback = await prisma.message.findFirst({
        where: {
          conversationId: conversation.id,
          metadata: { path: ["fallback"], equals: "delay_response" },
        },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      });

      const lastFallbackMs = lastFallback ? new Date(lastFallback.createdAt).getTime() : 0;
      const cooldownExpired = !lastFallback || Date.now() - lastFallbackMs > FALLBACK_COOLDOWN_MS;

      if (cooldownExpired) {
        const created = await prisma.message.create({
          data: {
            conversationId: conversation.id,
            sender: "AI",
            role: "ASSISTANT",
            content: FALLBACK_PROMPT,
            metadata: { fallback: "delay_response" },
          },
          select: { id: true, content: true, createdAt: true },
        });

        fallbackMessage = created;
      }
    } catch (error) {
      logError("chat.fallback_failed", error, { conversationId: conversation.id });
    }
  }

  // Single conversation update (status + metadata + lastMessageAt)
  try {
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        status: nextStatus,
        metadata: Object.keys(updatedMetadata).length ? updatedMetadata : conversation.metadata,
        lastMessageAt: new Date(),
      },
    });
  } catch (error) {
    logError("chat.conversation_update_failed", error, { conversationId: conversation.id });
  }

  // Notify admin if human help requested (non-blocking)
  if (humanRequested) {
    try {
      const { sendEmail, adminRecipients } = await import("@/app/lib/email/send");
      const { conversationRequestedHumanTemplate } = await import("@/app/lib/email/templates");
      const preview = messageText.slice(0, 160);

      void sendEmail({
        to: adminRecipients(sessionEmail),
        subject: `Conversation needs human attention (${conversation.id})`,
        html: conversationRequestedHumanTemplate(conversation.id, preview),
      });
    } catch (error) {
      logError("chat.admin_email_failed", error, { conversationId: conversation.id });
    }
  }

  // Build response message list (no duplicates)
  const responseMessages = [
    { id: userMessage.id, role: "user", content: userMessage.content, createdAt: userMessage.createdAt },
    ...(assistantMessage
      ? [{ id: assistantMessage.id, role: "assistant", content: assistantMessage.content, createdAt: assistantMessage.createdAt }]
      : []),
    ...(fallbackMessage
      ? [{ id: fallbackMessage.id, role: "assistant", content: fallbackMessage.content, createdAt: fallbackMessage.createdAt }]
      : []),
  ];

  // Realtime broadcast MUST happen before return
  try {
    publish({
  type: "message:new",
  conversationId: convoId,
  payload: { messages: responseMessages },
});

  } catch (error) {
    logError("chat.publish_failed", error, { conversationId: conversation.id });
  }

  return NextResponse.json({ messages: responseMessages });
}
