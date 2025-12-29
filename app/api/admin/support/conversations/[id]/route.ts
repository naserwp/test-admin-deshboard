import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const { id } = await params;
  if (!body?.status) return NextResponse.json({ error: "Status required" }, { status: 400 });

  const status =
    body.status === "AI_ONLY" ||
    body.status === "REQUESTED_HUMAN" ||
    body.status === "HUMAN_ACTIVE" ||
    body.status === "CLOSED"
      ? body.status
      : null;
  if (!status) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const conversation = await prisma.conversation.update({
    where: { id },
    data: { status, lastMessageAt: new Date() },
    select: { id: true, status: true, updatedAt: true },
  });

  return NextResponse.json({ conversation });
}
