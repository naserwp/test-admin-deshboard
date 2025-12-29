import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { sendEmail, adminRecipients, userRecipients } from "@/app/lib/email/send";
import { ticketCreatedTemplate } from "@/app/lib/email/templates";
import { logError } from "@/app/lib/log";
import { generateSupportTicketId } from "@/app/lib/support/ticketId";
import path from "path";
import fs from "fs/promises";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const take = Math.min(Number(searchParams.get("limit") || 20), 50);
  const cursor = searchParams.get("cursor") || undefined;

  const tickets = await prisma.supportTicket.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    take: take + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    select: {
      id: true,
      subject: true,
      status: true,
      priority: true,
      visitorEmail: true,
      createdAt: true,
      updatedAt: true,
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: { id: true, content: true, sender: true, createdAt: true },
      },
    },
  });

  const hasNext = tickets.length > take;
  const items = tickets.slice(0, take);

  return NextResponse.json({
    tickets: items,
    nextCursor: hasNext ? items[items.length - 1].id : null,
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const contentType = request.headers.get("content-type") || "";
  const isFormData = contentType.includes("multipart/form-data");

  let body: any = null;
  let files: File[] = [];

  if (isFormData) {
    const form = await request.formData().catch(() => null);
    if (form) {
      body = Object.fromEntries(form.entries());
      files = form
        .getAll("attachments")
        .filter((f): f is File => f instanceof File && f.size > 0);
    }
  } else if (contentType.includes("application/json")) {
    body = await request.json().catch(() => null);
  }

  if (!body) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const subject = String(body.subject || "").trim();
  const message = String(body.message || body.description || "").trim();
  const visitorName = body.name ? String(body.name).trim() : "";
  const visitorEmail = body.email ? String(body.email).trim() : "";
  const visitorPhone = body.phone ? String(body.phone).trim() : "";

  if (!subject || !message) {
    return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
  }

  const hasSession = Boolean(session?.user?.id);
  if (!hasSession) {
    if (!visitorName) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    if (!visitorEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(visitorEmail)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }
  }

  const allowedMime = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const maxPerFile = 5 * 1024 * 1024; // 5MB
  const maxFiles = 5;

  if (files.length > maxFiles) {
    return NextResponse.json({ error: `Maximum ${maxFiles} images allowed` }, { status: 400 });
  }

  const savedAttachments: Array<{
    url: string;
    name: string;
    type: string;
    size: number;
  }> = [];

  if (files.length) {
    const uploadDir = path.join(process.cwd(), "public", "uploads", "support");
    await fs.mkdir(uploadDir, { recursive: true });

    for (const file of files) {
      if (!allowedMime.includes(file.type)) {
        return NextResponse.json({ error: "Only images are allowed (jpg, png, webp, gif)" }, { status: 400 });
      }
      if (file.size > maxPerFile) {
        return NextResponse.json({ error: "Each image must be under 5MB" }, { status: 400 });
      }
      const bytes = Buffer.from(await file.arrayBuffer());
      const safeName = file.name
        .normalize("NFKD")
        .replace(/[^\x20-\x7E]/g, "")
        .replace(/[^a-zA-Z0-9._-]/g, "_");
      const filename = `${Date.now()}-${safeName || "image"}`;
      const diskPath = path.join(uploadDir, filename);
      await fs.writeFile(diskPath, bytes);
      const url = `/uploads/support/${filename}`;
      savedAttachments.push({
        url,
        name: file.name || filename,
        type: file.type,
        size: file.size,
      });
    }
  }

  const ticketId = await generateSupportTicketId();

  const userEmail = (session?.user as any)?.email ?? null;
  const userName = (session?.user as any)?.userId ?? (session?.user as any)?.name ?? userEmail ?? "User";

  const ticket = await prisma.supportTicket.create({
    data: {
      id: ticketId,
      subject,
      status: "OPEN",
      priority: "MEDIUM",
      userId: session?.user?.id ?? null,
      visitorEmail: visitorEmail || userEmail || null,
      messages: {
        create: {
          sender: "USER",
          content: message,
          metadata: {
            visitorName: visitorName || userName || null,
            visitorPhone: visitorPhone || null,
            visitorEmail: visitorEmail || userEmail || null,
            attachments: savedAttachments,
          },
        },
      },
    },
    select: { id: true, subject: true, status: true, priority: true, visitorEmail: true },
  });

  const preview = message.slice(0, 160);
  const notifyEmail = ticket.visitorEmail || userEmail;

  void sendEmail({
    to: adminRecipients(notifyEmail),
    subject: `New support ticket (${ticket.id})`,
    html: ticketCreatedTemplate(ticket.id, subject, preview),
  }).catch((err) => logError("email.ticket_create_admin_failed", err, { ticketId: ticket.id }));

  const userTo = userRecipients(notifyEmail);
  if (userTo.length) {
    void sendEmail({
      to: userTo,
      subject: `We received your ticket (${ticket.id})`,
      html: ticketCreatedTemplate(ticket.id, subject, preview),
    }).catch((err) => logError("email.ticket_create_user_failed", err, { ticketId: ticket.id }));
  }

  return NextResponse.json({ ticket });
}
