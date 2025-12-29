import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const take = Math.min(Number(searchParams.get("limit") || 50), 100);
  const cursor = searchParams.get("cursor") || undefined;
  const status = searchParams.get("status") || undefined;
  const search = searchParams.get("search") || "";

  const where: any = {};
  if (status) where.status = status as any;
  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { visitorEmail: { contains: search, mode: "insensitive" } },
      { visitorName: { contains: search, mode: "insensitive" } },
    ];
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
      visitorEmail: true,
      visitorName: true,
      visitorPhone: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      lastMessageAt: true,
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: { id: true, sender: true, content: true, createdAt: true },
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

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  if (!body?.id) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const status =
    body.status === "OPEN" || body.status === "CLOSED" || body.status === "ESCALATED"
      ? body.status
      : null;
  const data: any = {};
  if (status) data.status = status;
  if (body.lastMessageAt) data.lastMessageAt = new Date(body.lastMessageAt);

  const conversation = await prisma.conversation.update({
    where: { id: String(body.id) },
    data,
    select: { id: true, status: true, updatedAt: true },
  });

  return NextResponse.json({ conversation });
}
