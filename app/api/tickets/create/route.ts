import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { sendEmail, adminRecipients, userRecipients } from "@/app/lib/email/send";
import { ticketCreatedTemplate } from "@/app/lib/email/templates";
import { logError } from "@/app/lib/log";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const subject = String(body.subject || "").trim();
  if (!subject) {
    return NextResponse.json({ error: "Subject is required" }, { status: 400 });
  }

  const priority =
    body.priority === "LOW" ||
    body.priority === "MEDIUM" ||
    body.priority === "HIGH" ||
    body.priority === "URGENT"
      ? body.priority
      : "MEDIUM";

  const conversationId = body.conversationId ? String(body.conversationId) : null;
  const email = body.email ? String(body.email).trim() : null;

  const ticket = await prisma.ticket.create({
    data: {
      subject,
      priority,
      conversationId,
      userId: session.user.id,
      email: email || (session.user as any).email || null,
    },
  });

  if (body.message?.trim()) {
    await prisma.message.create({
      data: {
        conversationId: conversationId || (await ensureConversation(session.user.id, email)).id,
        sender: "USER",
        content: String(body.message),
      },
    });
  }

  const preview = body.message?.slice(0, 160) || subject.slice(0, 160);

  void sendEmail({
    to: adminRecipients(email),
    subject: `New support ticket (${ticket.id})`,
    html: ticketCreatedTemplate(ticket.id, subject, preview),
  }).catch((err) => logError("email.ticket_admin_failed", err, { ticketId: ticket.id }));

  const userTo = userRecipients(email || (session.user as any)?.email);
  if (userTo.length) {
    void sendEmail({
      to: userTo,
      subject: `We received your ticket (${ticket.id})`,
      html: ticketCreatedTemplate(ticket.id, subject, preview),
    }).catch((err) => logError("email.ticket_user_failed", err, { ticketId: ticket.id }));
  }

  return NextResponse.json({ ticket });
}

async function ensureConversation(userId: string, email: string | null) {
  const existing = await prisma.conversation.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  if (existing) return existing;
  return prisma.conversation.create({
    data: {
      userId,
      email,
      status: "AI_ONLY",
    },
  });
}
