import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "conversationId required" }, { status: 400 });

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    select: { id: true, userId: true, email: true, status: true, createdAt: true, lastMessageAt: true },
  });
  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isAdmin = session?.user?.role === "ADMIN";
  const isOwner = session?.user?.id && conversation.userId === session.user.id;
  const isGuestConversation = !conversation.userId;

  if (!isGuestConversation && !isOwner && !isAdmin) {
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      role: true,
      content: true,
      createdAt: true,
      metadata: true,
    },
  });

  return NextResponse.json({ conversation, messages });
}
