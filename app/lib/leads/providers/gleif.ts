import type { LeadProvider, LeadSearchParams } from "./types";
import type { NormalizedLead } from "../types";

type GleifEntity = {
  entity?: {
    legalName?: { name?: string };
    legalAddress?: {
      addressLine1?: string;
      city?: string;
      region?: string;
      country?: string;
    };
    headquartersAddress?: {
      addressLine1?: string;
      city?: string;
      region?: string;
      country?: string;
    };
  };
  lei?: string;
};

function pickAddress(entity: GleifEntity["entity"]) {
  const addr = entity?.headquartersAddress ?? entity?.legalAddress;
  if (!addr) return null;
  return {
    line1: addr.addressLine1 ?? null,
    city: addr.city ?? null,
    state: addr.region ?? null,
    country: addr.country ?? null,
  };
}

const gleifProvider: LeadProvider<GleifEntity> = {
  providerId: "gleif",
  name: "GLEIF LEI",
  async search(params: LeadSearchParams) {
    const query = params.keyword.trim();
    if (!query) return [];

    const url = new URL("https://api.gleif.org/api/v1/lei-records");
    url.searchParams.set("page[size]", String(Math.min(params.limit ?? 10, 20)));
    url.searchParams.set("filter[fulltext]", query);

    const response = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      return [];
    }
    const data = (await response.json()) as { data?: Array<{ attributes?: GleifEntity }> };
    const entities = data.data ?? [];

    return entities
      .map((item) => item.attributes)
      .filter(Boolean)
      .map((entity) => {
        const name = entity?.entity?.legalName?.name ?? "GLEIF Lead";
        return {
          businessName: name,
          website: null,
          phone: null,
          email: null,
          address: pickAddress(entity?.entity),
          source: "gleif",
          sourceUrl: null,
          confidence: 60,
          raw: entity,
        } as NormalizedLead;
      });
  },
};

export default gleifProvider;
