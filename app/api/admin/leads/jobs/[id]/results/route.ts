import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

function requireAdmin(session: any) {
  if (!session?.user) return { ok: false, status: 401, error: "Unauthorized" };
  if (session.user.role !== "ADMIN") {
    return { ok: false, status: 403, error: "Forbidden" };
  }
  return { ok: true as const };
}

async function resolveParams(
  params: { id: string } | Promise<{ id: string }>
) {
  return Promise.resolve(params);
}

function parseOptionalString(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const guard = requireAdmin(session);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const { id } = await resolveParams(params);
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const businessName = parseOptionalString(body.businessName);
  if (!businessName) {
    return NextResponse.json(
      { error: "Business name is required." },
      { status: 400 }
    );
  }

  const source = parseOptionalString(body.source);
  if (!source) {
    return NextResponse.json(
      { error: "Source attribution is required." },
      { status: 400 }
    );
  }

  const job = await prisma.leadJob.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const result = await prisma.leadResult.create({
    data: {
      jobId: id,
      businessName,
      industry: parseOptionalString(body.industry),
      website: parseOptionalString(body.website),
      phone: parseOptionalString(body.phone),
      email: parseOptionalString(body.email),
      addressLine1: parseOptionalString(body.addressLine1),
      addressLine2: parseOptionalString(body.addressLine2),
      city: parseOptionalString(body.city),
      state: parseOptionalString(body.state),
      postalCode: parseOptionalString(body.postalCode),
      country: parseOptionalString(body.country),
      source,
      sourceUrl: parseOptionalString(body.sourceUrl),
      confidence:
        body.confidence === undefined || body.confidence === null
          ? null
          : Number(body.confidence),
      notes: parseOptionalString(body.notes),
      rawJson: body.rawJson ?? null,
    },
  });

  return NextResponse.json({ result }, { status: 201 });
}
