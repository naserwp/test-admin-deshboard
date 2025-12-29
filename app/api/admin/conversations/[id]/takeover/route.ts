import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { publish } from "@/app/lib/realtime/bus";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;

  const conversation = await prisma.conversation.update({
    where: { id },
    data: {
      status: "HUMAN_ACTIVE",
      lastMessageAt: new Date(),
      messages: {
        create: {
          sender: "ADMIN",
          role: "SYSTEM",
          content: "Admin took over the conversation.",
          metadata: { type: "takeover", adminId: session.user.id },
        },
      },
    },
    select: { id: true, status: true, lastMessageAt: true },
  });

  publish({
    type: "status:update",
    conversationId: id,
    payload: { status: "HUMAN_ACTIVE" },
  });

  return NextResponse.json({ conversation });
}
