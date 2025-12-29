import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { sendEmail, adminRecipients } from "@/app/lib/email/send";
import { conversationRequestedHumanTemplate } from "@/app/lib/email/templates";
import { publish } from "@/app/lib/realtime/bus";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const body = await req.json().catch(() => null);
  const conversationId = body?.conversationId as string | undefined;

  if (!conversationId) {
    return NextResponse.json({ error: "conversationId required" }, { status: 400 });
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { id: true, userId: true, status: true, email: true, visitorEmail: true },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isAdmin = session?.user?.role === "ADMIN";
  const isOwner = session?.user?.id && conversation.userId === session.user.id;
  const isGuestConversation = !conversation.userId;

  if (!isGuestConversation && !isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (conversation.status === "HUMAN_ACTIVE") {
    return NextResponse.json({ conversation: { ...conversation, status: "HUMAN_ACTIVE" } });
  }

  const updated = await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      status: "REQUESTED_HUMAN",
      lastMessageAt: new Date(),
      messages: {
        create: {
          sender: "USER",
          role: "SYSTEM",
          content: "User requested live support",
          metadata: { type: "request_human" },
        },
      },
    },
    select: { id: true, status: true },
  });

  void sendEmail({
    to: adminRecipients(conversation.email ?? conversation.visitorEmail ?? null),
    subject: "New Live Support Request",
    html: conversationRequestedHumanTemplate(conversationId, "User requested live support"),
  });

  publish({
    type: "status:update",
    conversationId,
    payload: { status: "REQUESTED_HUMAN" },
  });

  return NextResponse.json({ conversation: updated });
}
