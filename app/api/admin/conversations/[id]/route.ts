import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const take = Math.min(Number(searchParams.get("limit") || 100), 200);
  const cursor = searchParams.get("cursor") || undefined;

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      email: true,
      userId: true,
      visitorName: true,
      visitorEmail: true,
      visitorPhone: true,
      createdAt: true,
      lastMessageAt: true,
    },
  });
  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: "asc" },
    take: take + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    select: {
      id: true,
      role: true,
      sender: true,
      content: true,
      createdAt: true,
      metadata: true,
    },
  });

  const hasNext = messages.length > take;
  const items = messages.slice(0, take);

  return NextResponse.json({
    conversation,
    messages: items,
    nextCursor: hasNext ? items[items.length - 1].id : null,
  });
}
