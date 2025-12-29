import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const isAdmin = session.user.role === "ADMIN";
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const take = Math.min(Number(searchParams.get("limit") || 50), 200);
  const cursor = searchParams.get("cursor") || undefined;

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      userId: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      lastMessageAt: true,
    },
  });
  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!isAdmin && conversation.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: "desc" },
    take: take + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    select: {
      id: true,
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
