import type { LeadProvider, LeadSearchParams, NormalizedLead } from "./types";

type OsmTagMap = Record<string, string | undefined>;

type OsmRawElement = {
  id: number;
  type: "node" | "way" | "relation";
  lat?: number;
  lon?: number;
  tags?: OsmTagMap;
};

type OsmRawResult = {
  name: string;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: {
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    country?: string | null;
  };
  url?: string | null;
  raw?: OsmRawElement;
};

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

const USER_AGENT = "VirtualOfficeLeads/1.0 (admin@localhost)";

function buildLocationQuery(params: LeadSearchParams) {
  const parts = [params.city, params.state, params.country].filter(Boolean);
  return parts.length ? parts.join(", ") : params.country ?? "";
}

async function fetchNominatim(params: LeadSearchParams) {
  const query = [params.keyword, buildLocationQuery(params)].filter(Boolean).join(" ");
  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("q", query);

  const response = await fetch(url.toString(), {
    headers: {
      "User-Agent": USER_AGENT,
      "Accept-Language": "en",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to resolve location.");
  }

  const results = (await response.json()) as Array<{
    lat: string;
    lon: string;
    boundingbox?: [string, string, string, string];
  }>;

  if (!results.length) {
    return null;
  }

  const result = results[0];
  const bbox = result.boundingbox
    ? result.boundingbox.map((value) => Number(value))
    : null;

  return {
    lat: Number(result.lat),
    lon: Number(result.lon),
    bbox,
  };
}

function buildOverpassQuery(params: LeadSearchParams, bbox: number[]) {
  const keyword = params.keyword.replace(/\"/g, "\\\"");
  const categories = [
    "amenity",
    "shop",
    "office",
    "craft",
    "tourism",
    "healthcare",
  ];

  const bboxString = bbox.join(",");
  const filters = categories
    .map((key) => `nwr[${key}][name~\"${keyword}\",i](${bboxString})`)
    .join(";\n");

  return `
[out:json][timeout:25];
(
${filters};
);
out center tags;
`.trim();
}

async function fetchOverpass(params: LeadSearchParams, bbox: number[]) {
  const query = buildOverpassQuery(params, bbox);
  const response = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": USER_AGENT,
    },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!response.ok) {
    throw new Error("Overpass query failed.");
  }

  const data = (await response.json()) as { elements?: OsmRawElement[] };
  return data.elements ?? [];
}

function pickTag(tags: OsmTagMap | undefined, keys: string[]) {
  if (!tags) return null;
  for (const key of keys) {
    const value = tags[key];
    if (value) return value;
  }
  return null;
}

function normalizeElement(element: OsmRawElement): OsmRawResult | null {
  const tags = element.tags;
  const name = tags?.name;
  if (!name) return null;

  const houseNumber = pickTag(tags, ["addr:housenumber"]);
  const street = pickTag(tags, ["addr:street"]);
  const line1 = [houseNumber, street].filter(Boolean).join(" ");

  return {
    name,
    website: pickTag(tags, ["website", "contact:website"]),
    phone: pickTag(tags, ["phone", "contact:phone"]),
    email: pickTag(tags, ["email", "contact:email"]),
    address: {
      line1: line1 || null,
      line2: pickTag(tags, ["addr:unit", "addr:floor"]),
      city: pickTag(tags, ["addr:city"]),
      state: pickTag(tags, ["addr:state"]),
      postalCode: pickTag(tags, ["addr:postcode"]),
      country: pickTag(tags, ["addr:country"]),
    },
    url: pickTag(tags, ["contact:website", "website"]) ?? null,
    raw: element,
  };
}

const osmProvider: LeadProvider<OsmRawResult> = {
  id: "osm",
  name: "OpenStreetMap",
  async search(params: LeadSearchParams) {
    const location = await fetchNominatim(params);
    if (!location) {
      return [];
    }

    const bboxValues = location.bbox ?? [
      location.lat - 0.05,
      location.lat + 0.05,
      location.lon - 0.05,
      location.lon + 0.05,
    ];
    const bbox = [
      bboxValues[0],
      bboxValues[2],
      bboxValues[1],
      bboxValues[3],
    ].map((value) => Number(value));

    const elements = await fetchOverpass(params, bbox);
    return elements.map((element) => normalizeElement(element)).filter(Boolean) as OsmRawResult[];
  },
  normalize(raw) {
    if (!raw?.name) return null;
    return {
      businessName: raw.name,
      website: raw.website ?? null,
      phone: raw.phone ?? null,
      email: raw.email ?? null,
      address: raw.address ?? null,
      source: "osm",
      sourceUrl: raw.url ?? null,
      confidence: 0.35,
      raw: raw.raw ?? raw,
    };
  },
  async enrich(lead: NormalizedLead) {
    return lead;
  },
};

export default osmProvider;
