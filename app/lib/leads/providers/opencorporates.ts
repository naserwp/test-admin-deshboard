import type { LeadProvider, LeadSearchParams } from "./types";
import type { NormalizedLead } from "../types";

type OpenCorporatesResponse = {
  results?: {
    companies?: Array<{
      company?: {
        name?: string;
        company_number?: string;
        jurisdiction_code?: string;
        registered_address_in_full?: string;
        opencorporates_url?: string;
      };
    }>;
  };
};

function buildLocationQuery(params: LeadSearchParams) {
  const parts = [params.city, params.state, params.country].filter(Boolean);
  return parts.length ? parts.join(", ") : params.country ?? "";
}

const opencorporatesProvider: LeadProvider<NormalizedLead> = {
  providerId: "opencorporates",
  name: "OpenCorporates",
  async search(params: LeadSearchParams) {
    const apiKey = process.env.OPENCORPORATES_API_KEY;
    if (!apiKey) return [];

    const url = new URL("https://api.opencorporates.com/v0.4/companies/search");
    url.searchParams.set("q", params.keyword);
    const location = buildLocationQuery(params);
    if (location) {
      url.searchParams.set("registered_address", location);
    }
    url.searchParams.set("api_token", apiKey);
    url.searchParams.set("per_page", String(params.limit ?? 20));

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error("OpenCorporates query failed.");
    }

    const data = (await response.json()) as OpenCorporatesResponse;
    const companies = data.results?.companies ?? [];

    return companies
      .map((entry) => entry.company)
      .filter((company) => company?.name)
      .map((company) => ({
        businessName: company?.name ?? "",
        address: {
          line1: company?.registered_address_in_full ?? null,
          city: params.city ?? null,
          state: params.state ?? null,
          country: params.country ?? null,
        },
        source: "opencorporates",
        sourceUrl: company?.opencorporates_url ?? null,
        confidence: 0.45,
        raw: company,
      }));
  },
};

export default opencorporatesProvider;
