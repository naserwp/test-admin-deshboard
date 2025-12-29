import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { publish } from "@/app/lib/realtime/bus";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  let message: string | null = null;
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const body = await request.json().catch(() => null);
    message = body?.message ?? null;
  } else {
    const form = await request.formData().catch(() => null);
    message = form?.get("message") ? String(form.get("message")) : null;
  }

  if (!message) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const adminMessage = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      sender: "ADMIN",
      role: "ADMIN",
      content: String(message),
      metadata: { adminId: session.user.id },
    },
  });

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: {
      lastMessageAt: new Date(),
    },
  });

  publish({
    type: "message:new",
    conversationId: conversation.id,
    payload: {
      messages: [
        {
          id: adminMessage.id,
          role: "admin",
          content: adminMessage.content,
          createdAt: adminMessage.createdAt,
        },
      ],
    },
  });

  return NextResponse.json({
    message: { id: adminMessage.id, content: adminMessage.content, createdAt: adminMessage.createdAt },
  });
}
