import type { NormalizedLead } from "./types";

function normalizeString(value: string | null | undefined) {
  return value ? value.trim().toLowerCase() : "";
}

function normalizePhone(value: string | null | undefined) {
  if (!value) return "";
  return value.replace(/[^\d]/g, "");
}

function extractDomain(value: string | null | undefined) {
  if (!value) return "";
  try {
    const url = value.startsWith("http") ? value : `https://${value}`;
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function buildDedupeKey(lead: NormalizedLead) {
  const domain = extractDomain(lead.website);
  if (domain) return `domain:${domain}`;

  const phone = normalizePhone(lead.phone);
  if (phone) return `phone:${phone}`;

  const name = normalizeString(lead.businessName);
  const city = normalizeString(lead.address?.city ?? lead.city);
  if (name && city) return `name-city:${name}|${city}`;

  const state = normalizeString(lead.address?.state ?? lead.state);
  if (name && state) return `name-state:${name}|${state}`;

  if (name) return `name:${name}`;

  return "";
}

export function dedupeLeads(leads: NormalizedLead[]) {
  const seen = new Map<string, NormalizedLead>();

  for (const lead of leads) {
    const key = buildDedupeKey(lead);
    if (!key) continue;
    if (!seen.has(key)) {
      seen.set(key, lead);
    }
  }

  return Array.from(seen.values());
}
