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
  const ticket = await prisma.supportTicket.findUnique({ where: { id } });
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const message = await prisma.supportTicketMessage.create({
    data: {
      ticketId: id,
      sender: "ADMIN",
      content: String(body.content),
    },
  });

  await prisma.supportTicket.update({
    where: { id },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json({ message });
}
