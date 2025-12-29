import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { enrichLeadWithAI } from "@/app/lib/leads/ai/enrich";
import { consumeTokens } from "@/app/lib/leads/rateLimit";
import { logLeadAudit } from "@/app/lib/leads/audit";

async function resolveParams(
  params: { id: string } | Promise<{ id: string }>
) {
  return Promise.resolve(params);
}

async function safeLogAudit(entry: Parameters<typeof logLeadAudit>[0]) {
  try {
    await logLeadAudit(entry);
  } catch {
    // Ignore audit failures to keep enrichment running.
  }
}

export async function POST(
  _request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured." },
      { status: 400 }
    );
  }

  const { id } = await resolveParams(params);
  const job = await prisma.leadJob.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const rate = consumeTokens(`lead-enrich:${job.userId}`, 1, {
    capacity: 5,
    refillRatePerMs: 5 / (60 * 60 * 1000),
  });
  if (!rate.allowed) {
    await safeLogAudit({
      userId: session.user.id,
      jobId: job.id,
      action: "enrich_rate_limited",
      providerId: "openai",
      count: 0,
      meta: { remaining: rate.remaining },
    });
    return NextResponse.json(
      { error: "Rate limit reached. Please try again later." },
      { status: 429 }
    );
  }

  const leads = await prisma.leadResult.findMany({
    where: {
      jobId: job.id,
      OR: [
        { industry: null },
        { notes: null },
        { confidence: null },
        { contactRole: null },
        { ownerName: null },
      ],
      isHidden: false,
      isArchived: false,
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  if (!leads.length) {
    return NextResponse.json({ enrichedCount: 0 });
  }

  let enrichedCount = 0;

  for (const lead of leads) {
    try {
      const enrichment = await enrichLeadWithAI(
        {
          businessName: lead.businessName,
          website: lead.website,
          phone: lead.phone,
          email: lead.email,
          address: {
            line1: lead.addressLine1,
            city: lead.city,
            state: lead.state,
            country: lead.country,
          },
          source: lead.source,
        },
        {
          keyword: job.keyword,
          context: job.context,
          country: job.country,
          state: job.state,
          city: job.city,
          industry: job.industry,
          size: job.size,
          limit: job.leadsTarget,
        }
      );

      const updates: any = {};
      if (enrichment.industry) updates.industry = enrichment.industry;
      if (enrichment.notes) updates.notes = enrichment.notes;
      if (enrichment.confidence !== undefined && enrichment.confidence !== null) {
        updates.confidence = enrichment.confidence;
      }
      if (enrichment.contactRole) updates.contactRole = enrichment.contactRole;
      if (enrichment.ownerName) updates.ownerName = enrichment.ownerName;

      if (Object.keys(updates).length > 0) {
        await prisma.leadResult.update({
          where: { id: lead.id },
          data: updates,
        });
        enrichedCount += 1;
      }
    } catch {
      continue;
    }
  }

  await safeLogAudit({
    userId: session.user.id,
    jobId: job.id,
    action: "enrich_completed",
    providerId: "openai",
    count: enrichedCount,
    meta: { attempted: leads.length },
  });

  return NextResponse.json({ enrichedCount });
}
