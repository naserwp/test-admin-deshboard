import type { LeadProvider, LeadSearchParams } from "./types";
import type { NormalizedLead } from "../types";

type GooglePlacesResponse = {
  results?: Array<{
    place_id?: string;
    name?: string;
    formatted_address?: string;
    geometry?: { location?: { lat?: number; lng?: number } };
    types?: string[];
  }>;
  status?: string;
};

type GooglePlaceDetailsResponse = {
  result?: {
    name?: string;
    formatted_address?: string;
    formatted_phone_number?: string;
    international_phone_number?: string;
    website?: string;
    types?: string[];
  };
  status?: string;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildLocationQuery(params: LeadSearchParams) {
  const parts = [params.city, params.state, params.country].filter(Boolean);
  return parts.length ? parts.join(", ") : params.country ?? "";
}

function inferIndustry(types?: string[]) {
  if (!types?.length) return null;
  return types[0]?.replace(/_/g, " ") ?? null;
}

function expandQueries(keyword: string) {
  const normalized = keyword.toLowerCase();
  const expansions = [keyword];

  if (/(credit|funding|loan|lending|finance)/i.test(normalized)) {
    expansions.push("business loan", "financial services", "credit union");
  }

  if (/business service/.test(normalized)) {
    expansions.push("business consulting", "business services", "consulting services");
  }

  return expansions.slice(0, 3);
}

async function fetchPlaceDetails(
  apiKey: string,
  placeId: string,
  delayMs: number
) {
  if (delayMs > 0) {
    await sleep(delayMs);
  }

  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", placeId);
  url.searchParams.set(
    "fields",
    [
      "name",
      "formatted_address",
      "formatted_phone_number",
      "international_phone_number",
      "website",
      "types",
    ].join(",")
  );
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Google Places details failed.");
  }
  const data = (await response.json()) as GooglePlaceDetailsResponse;
  return data.result ?? null;
}

const googlePlacesProvider: LeadProvider<NormalizedLead> = {
  providerId: "google-places",
  name: "Google Places",
  async search(params: LeadSearchParams) {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) return [];

    const location = buildLocationQuery(params);
    const queries = expandQueries(params.keyword);
    const results: NormalizedLead[] = [];
    const seen = new Set<string>();
    const detailsCap = Math.min(params.limit ?? 20, 20);
    let detailsCalls = 0;

    for (const query of queries) {
      const fullQuery = [query, location].filter(Boolean).join(" ");
      const url = new URL(
        "https://maps.googleapis.com/maps/api/place/textsearch/json"
      );
      url.searchParams.set("query", fullQuery);
      url.searchParams.set("key", apiKey);
      if (params.limit) {
        url.searchParams.set("maxResults", String(params.limit));
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error("Google Places query failed.");
      }
      const data = (await response.json()) as GooglePlacesResponse;
      const items = data.results ?? [];

      for (const item of items) {
        if (!item.name) continue;
        const key = item.place_id ?? `${item.name}:${item.formatted_address}`;
        if (seen.has(key)) continue;
        seen.add(key);
        let details: GooglePlaceDetailsResponse["result"] | null = null;
        if (item.place_id && detailsCalls < detailsCap) {
          try {
            details = await fetchPlaceDetails(apiKey, item.place_id, 120);
            detailsCalls += 1;
          } catch {
            details = null;
          }
        }

        const resolvedPhone =
          details?.international_phone_number ??
          details?.formatted_phone_number ??
          null;
        const resolvedWebsite = details?.website ?? null;
        const resolvedAddress =
          details?.formatted_address ?? item.formatted_address ?? null;
        const resolvedTypes = details?.types ?? item.types ?? [];

        results.push({
          businessName: details?.name ?? item.name ?? "",
          website: resolvedWebsite,
          phone: resolvedPhone,
          address: {
            line1: resolvedAddress,
            city: params.city ?? null,
            state: params.state ?? null,
            country: params.country ?? null,
          },
          source: "google-places",
          sourceUrl: item.place_id
            ? `https://maps.google.com/?q=place_id:${item.place_id}`
            : null,
          industry: inferIndustry(resolvedTypes),
          confidence: 65,
          raw: { textsearch: item, details },
        });
      }
    }

    return params.limit ? results.slice(0, params.limit) : results;
  },
};

export default googlePlacesProvider;
