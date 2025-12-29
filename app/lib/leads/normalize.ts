import type { LeadProvider } from "./providers/types";
import type { NormalizedLead } from "./types";

function isNormalizedLead(value: unknown): value is NormalizedLead {
  if (!value || typeof value !== "object") return false;
  const lead = value as NormalizedLead;
  return typeof lead.businessName === "string" && typeof lead.source === "string";
}

export function normalizeProviderResults<TRaw>(
  provider: LeadProvider<TRaw>,
  rawResults: TRaw[]
): NormalizedLead[] {
  if (provider.normalize) {
    return rawResults
      .map((result) => provider.normalize?.(result))
      .filter((lead): lead is NormalizedLead => Boolean(lead));
  }

  return rawResults.filter(isNormalizedLead);
}
