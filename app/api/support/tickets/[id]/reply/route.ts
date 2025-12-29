import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { sendEmail, adminRecipients, userRecipients } from "@/app/lib/email/send";
import { ticketReplyTemplate } from "@/app/lib/email/templates";
import { logError } from "@/app/lib/log";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  const contentType = request.headers.get("content-type") || "";
  let body: any = null;
  if (contentType.includes("application/json")) {
    body = await request.json().catch(() => null);
  } else {
    const form = await request.formData().catch(() => null);
    if (form) body = Object.fromEntries(form.entries());
  }
  const message = String(body?.message || "").trim();
  const visitorEmailOverride = body?.email ? String(body.email).trim() : null;
  if (!message) return NextResponse.json({ error: "Message required" }, { status: 400 });

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    select: { id: true, userId: true, visitorEmail: true },
  });
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isAdmin = session?.user?.role === "ADMIN";
  const isOwner = session?.user?.id && ticket.userId === session.user.id;
  const isGuestWithEmail =
    !session?.user?.id && visitorEmailOverride && ticket.visitorEmail === visitorEmailOverride;

  if (!isAdmin && !isOwner && !isGuestWithEmail) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const msg = await prisma.supportTicketMessage.create({
    data: {
      ticketId: ticket.id,
      sender: isAdmin ? "ADMIN" : "USER",
      content: message,
      metadata: visitorEmailOverride ? { visitorEmail: visitorEmailOverride } : {},
    },
  });

  await prisma.supportTicket.update({
    where: { id: ticket.id },
    data: { updatedAt: new Date() },
  });

  const userEmail = ticket.visitorEmail;
  if (isAdmin && userEmail) {
    void sendEmail({
      to: userRecipients(userEmail),
      subject: `Update on your ticket (${ticket.id})`,
      html: ticketReplyTemplate(ticket.id, message.slice(0, 160)),
    }).catch((err) => logError("email.ticket_reply_user_failed", err, { ticketId: ticket.id }));
  } else if (!isAdmin) {
    void sendEmail({
      to: adminRecipients(userEmail),
      subject: `Ticket reply from user (${ticket.id})`,
      html: ticketReplyTemplate(ticket.id, message.slice(0, 160)),
    }).catch((err) => logError("email.ticket_reply_admin_failed", err, { ticketId: ticket.id }));
  }

  return NextResponse.json({ message: { id: msg.id, createdAt: msg.createdAt } });
}
