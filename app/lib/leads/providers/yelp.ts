import type { LeadProvider, LeadSearchParams } from "./types";
import type { NormalizedLead } from "../types";

type YelpBusiness = {
  id?: string;
  name?: string;
  url?: string;
  phone?: string;
  location?: {
    address1?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    country?: string;
  };
  categories?: Array<{ title?: string }>;
};

type YelpResponse = {
  businesses?: YelpBusiness[];
};

function buildLocationQuery(params: LeadSearchParams) {
  const parts = [params.city, params.state, params.country].filter(Boolean);
  return parts.length ? parts.join(", ") : params.country ?? "";
}

const yelpProvider: LeadProvider<NormalizedLead> = {
  providerId: "yelp",
  name: "Yelp",
  async search(params: LeadSearchParams) {
    const apiKey = process.env.YELP_API_KEY;
    if (!apiKey) return [];

    const url = new URL("https://api.yelp.com/v3/businesses/search");
    url.searchParams.set("term", params.keyword);
    const location = buildLocationQuery(params);
    if (location) {
      url.searchParams.set("location", location);
    }
    url.searchParams.set("limit", String(params.limit ?? 20));

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    if (!response.ok) {
      throw new Error("Yelp query failed.");
    }

    const data = (await response.json()) as YelpResponse;
    return (data.businesses ?? [])
      .filter((item) => item.name)
      .map((item) => ({
        businessName: item.name ?? "",
        phone: item.phone ?? null,
        address: {
          line1: item.location?.address1 ?? null,
          city: item.location?.city ?? null,
          state: item.location?.state ?? null,
          postalCode: item.location?.zip_code ?? null,
          country: item.location?.country ?? null,
        },
        source: "yelp",
        sourceUrl: item.url ?? null,
        industry: item.categories?.[0]?.title ?? null,
        confidence: 60,
        raw: item,
      }));
  },
};

export default yelpProvider;
