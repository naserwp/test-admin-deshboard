import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { buildLeadResultsCsv } from "@/app/lib/leads/export";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const ids = url.searchParams.get("ids");
  const mode = url.searchParams.get("mode") ?? "all";
  const source = url.searchParams.get("source");
  const state = url.searchParams.get("state");
  const city = url.searchParams.get("city");
  const minConfidence = url.searchParams.get("minConfidence");
  const includeHidden = url.searchParams.get("includeHidden") === "true";
  const includeArchived = url.searchParams.get("includeArchived") === "true";

  const { id } = await params;
  const job = await prisma.leadJob.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const resultWhere: any = {
    jobId: job.id,
  };
  if (mode === "selected" && ids) {
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
