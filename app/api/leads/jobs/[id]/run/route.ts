import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { normalizeProviderResults } from "@/app/lib/leads/normalize";
import { dedupeLeads } from "@/app/lib/leads/dedupe";
import { enrichLeadWithAI } from "@/app/lib/leads/ai/enrich";
import { consumeTokens } from "@/app/lib/leads/rateLimit";
import { logLeadAudit } from "@/app/lib/leads/audit";
import { listEnabledProviders } from "@/app/lib/leads/providers/registry";

async function resolveParams(
  params: { id: string } | Promise<{ id: string }>
) {
  return Promise.resolve(params);
}

function guessEmailFromWebsite(website: string | null | undefined) {
  if (!website) return null;
  try {
    const url = new URL(website.startsWith("http") ? website : `https://${website}`);
    const domain = url.hostname.replace(/^www\./, "");
    if (!domain || !domain.includes(".")) return null;
    return `info@${domain}`;
  } catch {
    return null;
  }
}

async function safeLogAudit(entry: Parameters<typeof logLeadAudit>[0]) {
  try {
    await logLeadAudit(entry);
  } catch {
    // Ignore audit failures to keep lead runs alive.
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

  let requestCount = 0;
  const { id } = await resolveParams(params);
  const isAdmin = session.user.role === "ADMIN";
  const scrapingEnabled = process.env.LEADS_SCRAPING_ENABLED !== "false";

  const job = await prisma.leadJob.findFirst({
    where: isAdmin ? { id } : { id, userId: session.user.id },
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const user = await prisma.user.findUnique({
    where: { id: job.userId },
    select: { canRequestLeads: true },
  });
  if (!isAdmin && !user?.canRequestLeads) {
    return NextResponse.json(
      { error: "Lead requests are disabled for this account." },
      { status: 403 }
    );
  }

  if (!scrapingEnabled) {
    await safeLogAudit({
      userId: session.user.id,
      jobId: job.id,
      action: "blocked",
      providerId: "multi",
      count: 0,
      meta: { reason: "scraping_disabled" },
    });
    return NextResponse.json(
      { error: "Lead collection is disabled by compliance settings." },
      { status: 403 }
    );
  }

  const rate = consumeTokens(`lead-run:${job.userId}`, 1, {
    capacity: 10,
    refillRatePerMs: 10 / (60 * 60 * 1000),
  });
  if (!rate.allowed) {
    await safeLogAudit({
      userId: session.user.id,
      jobId: job.id,
      action: "rate_limited",
      providerId: "multi",
      count: 0,
      meta: { remaining: rate.remaining },
    });
    return NextResponse.json(
      { error: "Rate limit reached. Please try again later." },
      { status: 429 }
    );
  }

  try {
    await prisma.leadJob.update({
      where: { id: job.id },
      data: { status: "RUNNING", progress: 5 },
    });

    const paramsInput = {
      keyword: job.keyword,
      context: job.context,
      country: job.country ?? undefined,
      state: job.state ?? undefined,
      city: job.city ?? undefined,
      industry: job.industry ?? undefined,
      size: job.size ?? undefined,
      limit: job.leadsTarget,
    };

    const providers = listEnabledProviders();
    const safeAllowList = new Set([
      "osm",
      "google-places",
      "yelp",
      "opencorporates",
    ]);
    const activeProviders = job.safeMode
      ? providers.filter((provider) => {
          const id = provider.providerId ?? provider.id ?? "";
          return safeAllowList.has(id);
        })
      : providers;
    const aggregated: Array<{ provider: (typeof providers)[number]; leads: unknown[] }> = [];

    for (const provider of activeProviders) {
      const result = await provider.search(paramsInput);
      const arrayResult = Array.isArray(result) ? result : [];
      aggregated.push({ provider, leads: arrayResult });
      requestCount += 1;
    }
    await prisma.leadJob.update({
      where: { id: job.id },
      data: { progress: 45 },
    });

    const normalized = aggregated.flatMap(({ provider, leads }) => {
      const providerId = provider.providerId ?? provider.id ?? "unknown";
      return normalizeProviderResults(provider, leads).map((lead) => ({
        ...lead,
        source: lead.source || providerId,
      }));
    });
    const deduped = dedupeLeads(normalized);
    const capped = deduped.slice(0, job.leadsTarget);

    let enriched = capped;
    if (process.env.OPENAI_API_KEY) {
      enriched = [];
      for (const lead of capped) {
        const ai = await enrichLeadWithAI(lead, paramsInput);
        enriched.push({
          ...lead,
          industry: ai.industry ?? lead.industry,
          confidence: ai.confidence ?? lead.confidence,
          notes: ai.notes ?? lead.notes,
        });
      }
    }

    enriched = enriched.map((lead) => {
      if (!lead.email && lead.website && !lead.notes) {
        const guess = guessEmailFromWebsite(lead.website);
        if (guess) {
          return { ...lead, notes: `Possible email: ${guess}` };
        }
      }
      return lead;
    });

    await prisma.leadJob.update({
      where: { id: job.id },
      data: { progress: 80 },
    });

    if (enriched.length) {
      await prisma.leadResult.createMany({
        data: enriched.map((lead) => ({
          jobId: job.id,
          businessName: lead.businessName,
          industry: lead.industry ?? null,
          website: lead.website ?? null,
          phone: lead.phone ?? null,
          email: lead.email ?? null,
          addressLine1: lead.address?.line1 ?? null,
          addressLine2: lead.address?.line2 ?? null,
          city: lead.address?.city ?? null,
          state: lead.address?.state ?? null,
          postalCode: lead.address?.postalCode ?? null,
          country: lead.address?.country ?? null,
          source: lead.source ?? "unknown",
          sourceUrl: lead.sourceUrl ?? null,
          confidence: lead.confidence ?? null,
          notes: lead.notes ?? null,
          rawJson: lead.raw ?? null,
        })),
      });
    }

    await prisma.leadJob.update({
      where: { id: job.id },
      data: { status: "COMPLETED", progress: 100 },
    });

    await safeLogAudit({
      userId: session.user.id,
      jobId: job.id,
      action: "completed",
      providerId: "multi",
      count: enriched.length,
      meta: {
        totalFound: normalized.length,
        requestCount,
        safeMode: job.safeMode,
      },
    });

    return NextResponse.json({
      insertedCount: enriched.length,
      totalFound: normalized.length,
    });
  } catch (error) {
    await prisma.leadJob.update({
      where: { id: job.id },
      data: { status: "FAILED", progress: 0 },
    });
    await safeLogAudit({
      userId: session.user.id,
      jobId: job.id,
      action: "failed",
      providerId: "multi",
      count: 0,
      meta: {
        message: error instanceof Error ? error.message : "unknown",
        requestCount,
      },
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Lead run failed." },
      { status: 500 }
    );
  }
}
