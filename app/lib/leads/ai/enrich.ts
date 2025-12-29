import { z } from "zod";
import { runOpenAIChat } from "@/app/lib/openai/client";
import { LEAD_ENRICH_SYSTEM_PROMPT, buildLeadEnrichmentPrompt } from "./prompts";
import type { LeadSearchParams } from "@/app/lib/leads/providers/types";
import type { NormalizedLead } from "@/app/lib/leads/types";

const LeadEnrichmentSchema = z.object({
  industry: z.string().min(1).max(80).optional().nullable(),
  confidence: z.number().min(0).max(100).optional().nullable(),
  notes: z.string().min(1).max(280).optional().nullable(),
  contactRole: z.string().min(1).max(80).optional().nullable(),
  ownerName: z.string().min(1).max(120).optional().nullable(),
});

export type LeadEnrichment = z.infer<typeof LeadEnrichmentSchema>;

function extractJson(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    return null;
  }
  const slice = text.slice(start, end + 1);
  try {
    return JSON.parse(slice);
  } catch {
    return null;
  }
}

export async function enrichLeadWithAI(
  lead: NormalizedLead,
  params: LeadSearchParams
) {
  const prompt = buildLeadEnrichmentPrompt({
    keyword: params.keyword,
    context: params.context,
    businessName: lead.businessName,
    website: lead.website,
    address: [
      lead.address?.line1,
      lead.address?.city,
      lead.address?.state,
      lead.address?.country,
    ]
      .filter(Boolean)
      .join(", "),
  });

  const content = await runOpenAIChat([
    { role: "system", content: LEAD_ENRICH_SYSTEM_PROMPT },
    { role: "user", content: prompt },
  ]);

  const parsed = extractJson(content);
  const result = LeadEnrichmentSchema.safeParse(parsed);
  if (!result.success) {
    return {};
  }

  return result.data as LeadEnrichment;
}
