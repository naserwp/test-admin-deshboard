import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { buildLeadResultsCsv } from "@/app/lib/leads/export";

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
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const guard = requireAdmin(session);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const url = new URL(request.url);
  const ids = url.searchParams.get("ids");
  const source = url.searchParams.get("source");
  const state = url.searchParams.get("state");
  const city = url.searchParams.get("city");
  const minConfidence = url.searchParams.get("minConfidence");
  const includeHidden = url.searchParams.get("includeHidden") === "true";
  const includeArchived = url.searchParams.get("includeArchived") === "true";

  const { id } = await resolveParams(params);
  const job = await prisma.leadJob.findUnique({
    where: { id },
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const resultWhere: any = {
    jobId: job.id,
  };
  if (ids) {
    resultWhere.id = { in: ids.split(",").map((value) => value.trim()).filter(Boolean) };
  }
  if (source) {
    resultWhere.source = source;
  }
  if (state) {
    resultWhere.state = state;
  }
  if (city) {
    resultWhere.city = city;
  }
  if (minConfidence) {
    const min = Number(minConfidence);
    if (Number.isFinite(min)) {
      resultWhere.confidence = { gte: min };
    }
  }
  if (!includeHidden) {
    resultWhere.isHidden = false;
  }
  if (!includeArchived) {
    resultWhere.isArchived = false;
  }

  const results = await prisma.leadResult.findMany({
    where: resultWhere,
    orderBy: { createdAt: "desc" },
  });

  const csv = buildLeadResultsCsv(results);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename=\"lead-results-${job.id}.csv\"`,
    },
  });
}
