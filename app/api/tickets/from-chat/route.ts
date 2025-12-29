import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { sendEmail, adminRecipients, userRecipients } from "@/app/lib/email/send";
import { ticketCreatedTemplate } from "@/app/lib/email/templates";
import { logError } from "@/app/lib/log";
import { chatWithOpenAI } from "@/app/lib/openai/chat";
import { generateSupportTicketId } from "@/app/lib/support/ticketId";

async function summarizeConversation(conversationId: string) {
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    select: { role: true, content: true },
  });
  const prompt = [
    { role: "system", content: "Summarize the conversation in one short subject line, under 100 characters." },
    ...messages.map((m) => ({
      role:
        m.role === "ASSISTANT"
          ? "assistant"
          : m.role === "SYSTEM"
          ? "system"
          : m.role === "ADMIN"
          ? "assistant"
          : "user",
      content: m.content,
    })),
  ];
  const summary = await chatWithOpenAI(prompt as any);
  return summary.slice(0, 120);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const conversationId = body?.conversationId as string | undefined;
  const subjectOverride = body?.subject ? String(body.subject).trim() : "";
  if (!conversationId) return NextResponse.json({ error: "conversationId required" }, { status: 400 });

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { id: true, userId: true, email: true },
  });
  if (!conversation) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

  const summary = subjectOverride || (await summarizeConversation(conversationId));
  const transcript = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    select: { role: true, content: true, createdAt: true },
  });

  const ticketId = await generateSupportTicketId();

  const ticket = await prisma.supportTicket.create({
    data: {
      id: ticketId,
      subject: summary || "Support ticket",
      status: "OPEN",
      priority: "MEDIUM",
      userId: conversation.userId,
      visitorEmail: conversation.email,
    },
  });

  if (transcript.length) {
    await prisma.supportTicketMessage.createMany({
      data: transcript.map((m) => ({
        ticketId: ticket.id,
        sender: m.role as any,
        content: m.content,
        metadata: { createdAt: m.createdAt },
      })),
    });
  }

  await prisma.message.create({
    data: {
      conversationId,
      sender: "USER",
      role: "SYSTEM",
      content: `[Ticket created from chat: ${ticket.id}]`,
    },
  });

  const preview = transcript[transcript.length - 1]?.content?.slice(0, 160) ?? summary;

  void sendEmail({
    to: adminRecipients(conversation.email ?? null),
    subject: `New support ticket from chat (${ticket.id})`,
    html: ticketCreatedTemplate(ticket.id, summary || "Support ticket", preview || ""),
  }).catch((err) => logError("email.ticket_from_chat_admin_failed", err, { ticketId: ticket.id }));

  const userTo = userRecipients(conversation.email);
  if (userTo.length) {
    void sendEmail({
      to: userTo,
      subject: `Ticket created from chat (${ticket.id})`,
      html: ticketCreatedTemplate(ticket.id, summary || "Support ticket", preview || ""),
    }).catch((err) => logError("email.ticket_from_chat_user_failed", err, { ticketId: ticket.id }));
  }

  return NextResponse.json({ ticket });
}
