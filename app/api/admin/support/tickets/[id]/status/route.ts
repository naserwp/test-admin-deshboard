import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { sendEmail, adminRecipients, userRecipients } from "@/app/lib/email/send";
import { ticketStatusChangedTemplate } from "@/app/lib/email/templates";
import { logError } from "@/app/lib/log";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const contentType = request.headers.get("content-type") || "";
  let body: any = null;
  if (contentType.includes("application/json")) {
    body = await request.json().catch(() => null);
  } else {
    const form = await request.formData().catch(() => null);
    if (form) body = Object.fromEntries(form.entries());
  }
  const nextStatus = String(body?.status || "").toUpperCase();

  if (!["OPEN", "PENDING", "RESOLVED", "CLOSED"].includes(nextStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const { id } = await params;
  const ticket = await prisma.supportTicket.update({
    where: { id },
    data: { status: nextStatus as any, updatedAt: new Date() },
    select: { id: true, status: true, visitorEmail: true },
  });

  const userEmail = ticket.visitorEmail;
  const preview = `Ticket status updated to ${ticket.status}`;

  void sendEmail({
    to: adminRecipients(userEmail),
    subject: `Ticket ${ticket.id} status changed`,
    html: ticketStatusChangedTemplate(ticket.id, ticket.status),
  }).catch((err) => logError("email.ticket_status_admin_failed", err, { ticketId: ticket.id, status: ticket.status }));

  if (userEmail) {
    void sendEmail({
      to: userRecipients(userEmail),
      subject: `Update on your ticket (${ticket.id})`,
      html: ticketStatusChangedTemplate(ticket.id, ticket.status),
    }).catch((err) => logError("email.ticket_status_user_failed", err, { ticketId: ticket.id, status: ticket.status }));
  }

  return NextResponse.json({ ticket });
}
