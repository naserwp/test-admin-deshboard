import type { LeadProvider, LeadSearchParams } from "./types";
import type { NormalizedLead } from "../types";

type SerpResult = {
  title?: string;
  link?: string;
  snippet?: string;
  source?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  phone?: string;
};

function safeString(value: unknown) {
  return typeof value === "string" && value.trim().length ? value.trim() : null;
}

const serpProvider: LeadProvider<SerpResult> = {
  providerId: "serp",
  name: "SERP API",
  async search(params: LeadSearchParams) {
    const apiKey = process.env.SERP_API_KEY;
    if (!apiKey) return [];

    const queryParts = [params.keyword];
    if (params.city || params.state || params.country) {
      queryParts.push([params.city, params.state, params.country].filter(Boolean).join(", "));
    }
    if (params.businessType && params.businessType !== "ALL") {
      queryParts.push(params.businessType === "B2B" ? "B2B" : "consumer");
    }

    const url = new URL("https://serpapi.com/search");
    url.searchParams.set("engine", "google");
    url.searchParams.set("q", queryParts.join(" "));
    url.searchParams.set("api_key", apiKey);

    const response = await fetch(url.toString());
    if (!response.ok) {
      return [];
    }
    const data = (await response.json()) as { organic_results?: SerpResult[] };
    const results = data.organic_results ?? [];

    return results.slice(0, params.limit ?? 15).map((result) => {
      const title = safeString(result.title) ?? "Lead";
      const link = safeString(result.link);
      const phone = safeString(result.phone);
      const source = safeString(result.source) ?? "serp";
      const snippet = safeString(result.snippet);

      return {
        businessName: title,
        website: link,
        phone,
        email: null,
        address: result.address
          ? {
              line1: safeString(result.address.street),
              city: safeString(result.address.city),
              state: safeString(result.address.state),
              country: safeString(result.address.country),
            }
          : null,
        source,
        sourceUrl: link,
        confidence: 55,
        notes: snippet ?? undefined,
        raw: result,
      } as NormalizedLead;
    });
  },
};

export default serpProvider;
