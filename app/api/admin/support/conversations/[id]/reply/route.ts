import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.content) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const { id } = await params;
  const conversation = await prisma.conversation.findUnique({ where: { id } });
  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const message = await prisma.message.create({
    data: {
      conversationId: id,
      sender: "ADMIN",
      role: "ADMIN",
      content: String(body.content),
    },
  });

  await prisma.conversation.update({
    where: { id },
    data: { status: "HUMAN_ACTIVE", lastMessageAt: new Date() },
  });

  return NextResponse.json({ message });
}
