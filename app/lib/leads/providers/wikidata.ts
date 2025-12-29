import type { LeadProvider, LeadSearchParams, NormalizedLead } from "./types";

type WikidataRawResult = {
  label?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  entityUrl?: string;
};

const wikidataProvider: LeadProvider<WikidataRawResult> = {
  id: "wikidata",
  name: "Wikidata",
  async search(_params: LeadSearchParams) {
    return [];
  },
  normalize(raw) {
    if (!raw?.label) return null;
    return {
      businessName: raw.label,
      website: raw.website ?? null,
      phone: raw.phone ?? null,
      email: raw.email ?? null,
      address: raw.address ?? null,
      source: "wikidata",
      sourceUrl: raw.entityUrl ?? null,
      confidence: 0.35,
      raw,
    };
  },
  async enrich(lead: NormalizedLead) {
    return lead;
  },
};

export default wikidataProvider;
