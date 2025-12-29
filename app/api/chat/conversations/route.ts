import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = session.user.role === "ADMIN";
  const { searchParams } = new URL(request.url);
  const take = Math.min(Number(searchParams.get("limit") || 20), 100);
  const cursor = searchParams.get("cursor") || undefined;
  const status = searchParams.get("status") || undefined;
  const emailFilter = searchParams.get("email") || undefined;

  const where: any = {};
  if (!isAdmin) {
    where.userId = session.user.id;
  } else {
    if (emailFilter) where.email = emailFilter;
    if (status) where.status = status as any;
  }

  const conversations = await prisma.conversation.findMany({
    where,
    orderBy: { lastMessageAt: "desc" },
    take: take + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    select: {
      id: true,
      email: true,
      userId: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      lastMessageAt: true,
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          sender: true,
          content: true,
          createdAt: true,
        },
      },
    },
  });

  const hasNext = conversations.length > take;
  const items = conversations.slice(0, take);

  return NextResponse.json({
    conversations: items,
    nextCursor: hasNext ? items[items.length - 1].id : null,
  });
}
