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

export async function GET(
  _request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const guard = requireAdmin(session);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const { id } = await resolveParams(params);
  const job = await prisma.leadJob.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, userId: true, email: true } },
      results: true,
    },
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json({ job });
}

export async function PATCH(
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

  const updates: any = {};

  if (typeof body.keyword === "string") {
    const keyword = body.keyword.trim();
    if (!keyword) {
      return NextResponse.json({ error: "Keyword is required." }, { status: 400 });
    }
    updates.keyword = keyword;
  }

  if (typeof body.context === "string") {
    updates.context = body.context.trim() || null;
  }

  if (typeof body.status === "string") {
    const allowed = ["QUEUED", "RUNNING", "COMPLETED", "FAILED"];
    if (!allowed.includes(body.status)) {
      return NextResponse.json(
        { error: "Invalid status value." },
        { status: 400 }
      );
    }
    updates.status = body.status;
  }

  if (body.leadsTarget !== undefined) {
    const leadsTargetValue = Number(body.leadsTarget);
    if (!Number.isFinite(leadsTargetValue) || leadsTargetValue < 1) {
      return NextResponse.json(
        { error: "Leads target must be at least 1." },
        { status: 400 }
      );
    }
    updates.leadsTarget = Math.round(leadsTargetValue);
  }

  if (body.progress !== undefined) {
    const progressValue = Number(body.progress);
    if (!Number.isFinite(progressValue) || progressValue < 0) {
      return NextResponse.json(
        { error: "Progress must be between 0 and 100." },
        { status: 400 }
      );
    }
    updates.progress = Math.min(100, Math.round(progressValue));
  }

  const job = await prisma.leadJob.update({
    where: { id },
    data: updates,
    include: {
      user: { select: { id: true, userId: true, email: true } },
      results: true,
    },
  });

  return NextResponse.json({ job });
}
