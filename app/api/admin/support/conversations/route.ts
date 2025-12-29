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
  const status = searchParams.get("status") || undefined;
  const conversations = await prisma.conversation.findMany({
    where: {
      ...(status ? { status: status as any } : {}),
    },
    orderBy: { lastMessageAt: "desc" },
    take: 50,
    select: {
      id: true,
      email: true,
      userId: true,
      status: true,
      createdAt: true,
      lastMessageAt: true,
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: { id: true, content: true, role: true, createdAt: true },
      },
    },
  });

  return NextResponse.json({ conversations });
}
