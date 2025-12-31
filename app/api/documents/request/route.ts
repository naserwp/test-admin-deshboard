import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { sendEmail, adminRecipients, userRecipients } from "@/app/lib/email/send";
import { businessDocumentAdminTemplate, businessDocumentUserTemplate } from "@/app/lib/email/templates";
import { logError } from "@/app/lib/log";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim().toLowerCase();
    const phone = String(body?.phone || "").trim();
    const docType = String(body?.docType || "").trim();
    const businessName = String(body?.businessName || "").trim();
    const state = String(body?.state || "").trim() || null;
    const notes = String(body?.notes || "").trim();

    if (!name || !email || !phone || !docType || !businessName || !notes) {
      return NextResponse.json({ error: "All required fields must be filled in." }, { status: 400 });
    }
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailValid) {
      return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
    }

    const requestRecord = await prisma.businessDocumentRequest.create({
      data: {
        userId: session?.user?.id ?? null,
        name,
        email,
        phone,
        docType,
        businessName,
        state,
        notes,
      },
    });

    const adminHtml = businessDocumentAdminTemplate({
      name,
      email,
      phone,
      docType,
      businessName,
      state,
      notes,
      requestId: requestRecord.id,
    });
    await sendEmail({
      to: adminRecipients(email),
      subject: `New document request from ${name}`,
      html: adminHtml,
    }).catch((err) =>
      logError("email.document_request_admin_failed", err, { requestId: requestRecord.id })
    );

    const userHtml = businessDocumentUserTemplate({ name });
    await sendEmail({
      to: userRecipients(email),
      subject: "We received your document request",
      html: userHtml,
    }).catch((err) =>
      logError("email.document_request_user_failed", err, { requestId: requestRecord.id })
    );

    return NextResponse.json({ ok: true, requestId: requestRecord.id });
  } catch (error) {
    logError("document_request_create_failed", error);
    return NextResponse.json({ error: "Unable to submit request." }, { status: 500 });
  }
}
