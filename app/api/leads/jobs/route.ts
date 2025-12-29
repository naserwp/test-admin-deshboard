import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

function parseOptionalString(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const jobs = await prisma.leadJob.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ jobs });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, canRequestLeads: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "ADMIN" && !user.canRequestLeads) {
    return NextResponse.json(
      { error: "Lead requests are disabled for your account." },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const keyword = parseOptionalString(body.keyword);
  if (!keyword) {
    return NextResponse.json({ error: "Keyword is required." }, { status: 400 });
  }

  const leadsTargetValue = Number(body.leadsTarget ?? 50);
  if (!Number.isFinite(leadsTargetValue) || leadsTargetValue < 1) {
    return NextResponse.json({ error: "Leads target must be at least 1." }, { status: 400 });
  }

  const sizeInput = body.size ?? body.businessSize;
  const size = parseOptionalString(sizeInput);
  const normalizedSize = size === "Any" ? null : size;

  const job = await prisma.leadJob.create({
    data: {
      userId: session.user.id,
      keyword,
      context: parseOptionalString(body.context),
      country: parseOptionalString(body.country),
      state: parseOptionalString(body.state),
      city: parseOptionalString(body.city),
      businessSize: normalizedSize,
      industry: parseOptionalString(body.industry),
      size: normalizedSize,
      leadsTarget: Math.round(leadsTargetValue),
      status: "PENDING",
      progress: 0,
    },
  });

  const origin = new URL(request.url).origin;
  const cookie = request.headers.get("cookie") ?? "";
  let runTriggered = false;

  try {
    runTriggered = true;
    void fetch(`${origin}/api/leads/jobs/${job.id}/run`, {
      method: "POST",
      headers: {
        cookie,
      },
    });
  } catch {
    runTriggered = false;
  }

  return NextResponse.json({ job, runTriggered }, { status: 201 });
}
