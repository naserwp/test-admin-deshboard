import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { sendEmail, adminRecipients, userRecipients } from "@/app/lib/email/send";
import { talkToSalesAdminTemplate, talkToSalesUserTemplate } from "@/app/lib/email/templates";
import { logError } from "@/app/lib/log";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim().toLowerCase();
    const phone = String(body?.phone || "").trim() || null;
    const company = String(body?.company || "").trim() || null;
    const message = String(body?.message || "").trim();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
    }
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailValid) {
      return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
    }

    const lead = await prisma.talkToSalesLead.create({
      data: {
        name,
        email,
        phone,
        company,
        message,
      },
    });

    const adminHtml = talkToSalesAdminTemplate({
      name,
      email,
      phone,
      company,
      message,
      leadId: lead.id,
    });
    await sendEmail({
      to: adminRecipients(email),
      subject: `New Talk to Sales lead from ${name}`,
      html: adminHtml,
    }).catch((err) => logError("email.talk_to_sales_admin_failed", err, { leadId: lead.id }));

    const userHtml = talkToSalesUserTemplate({ name, company });
    await sendEmail({
      to: userRecipients(email),
      subject: "Thanks for contacting Virtual Office",
      html: userHtml,
    }).catch((err) => logError("email.talk_to_sales_user_failed", err, { leadId: lead.id }));

    // TODO: Push lead to Google Sheets when integrations are enabled.
    // TODO: Create Google Calendar booking when scheduling is enabled.

    return NextResponse.json({ ok: true, leadId: lead.id });
  } catch (error) {
    logError("talk_to_sales_create_failed", error);
    return NextResponse.json({ error: "Unable to submit request." }, { status: 500 });
  }
}
