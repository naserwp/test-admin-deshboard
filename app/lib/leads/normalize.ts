import type { LeadProvider } from "./providers/types";
import type { NormalizedLead } from "./types";

/**
 * Proper type guard for NormalizedLead
 */
function isNormalizedLead(value: unknown): value is NormalizedLead {
  if (!value || typeof value !== "object") return false;

  const lead = value as Partial<NormalizedLead>;

  return (
    typeof lead.businessName === "string" &&
    lead.businessName.length > 0 &&
    typeof lead.source === "string" &&
    lead.source.length > 0
  );
}

/**
 * Normalize provider results into NormalizedLead[]
 */
export function normalizeProviderResults<TRaw>(
  provider: LeadProvider<TRaw>,
  rawResults: TRaw[]
): NormalizedLead[] {
  // If provider has its own normalize method
  if (provider.normalize) {
    return rawResults
      .map((result) => provider.normalize!(result))
      .filter((lead): lead is NormalizedLead => isNormalizedLead(lead));
  }

  // Otherwise, assume raw results may already be normalized
  return rawResults
    .map((item) => item as unknown)
    .filter(isNormalizedLead);
}
