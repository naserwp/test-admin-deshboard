import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { sendEmail, adminRecipients, userRecipients } from "@/app/lib/email/send";
import { ticketStatusChangedTemplate } from "@/app/lib/email/templates";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const take = Math.min(Number(searchParams.get("limit") || 50), 100);
  const cursor = searchParams.get("cursor") || undefined;
  const status = searchParams.get("status") || undefined;

  const where: any = {};
  if (status) where.status = status as any;

  const tickets = await prisma.ticket.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: take + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    select: {
      id: true,
      subject: true,
      status: true,
      priority: true,
      assigneeId: true,
      userId: true,
      email: true,
      conversationId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const hasNext = tickets.length > take;
  const items = tickets.slice(0, take);

  return NextResponse.json({
    tickets: items,
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

  const data: any = {};
  if (
    body.status === "OPEN" ||
    body.status === "IN_PROGRESS" ||
    body.status === "RESOLVED" ||
    body.status === "CLOSED"
  ) {
    data.status = body.status;
  }
  if (body.priority === "LOW" || body.priority === "MEDIUM" || body.priority === "HIGH" || body.priority === "URGENT") {
    data.priority = body.priority;
  }
  if (body.assigneeId) data.assigneeId = String(body.assigneeId);

  const ticket = await prisma.ticket.update({
    where: { id: String(body.id) },
    data,
    select: { id: true, status: true, priority: true, assigneeId: true, updatedAt: true, email: true },
  });

  if (data.status) {
    const html = ticketStatusChangedTemplate(ticket.id, data.status);
    void sendEmail({
      to: adminRecipients(),
      subject: `Ticket status updated (${ticket.id})`,
      html,
    });
    const userTo = userRecipients(ticket.email);
    if (userTo.length) {
      void sendEmail({
        to: userTo,
        subject: `Your ticket status changed (${ticket.id})`,
        html,
      });
    }
  }

  return NextResponse.json({ ticket });
}
