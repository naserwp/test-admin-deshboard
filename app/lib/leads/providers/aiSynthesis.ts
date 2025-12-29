import { runOpenAIChat } from "@/app/lib/openai/client";
import type { LeadProvider } from "./types";
import type { NormalizedLead } from "../types";

type AiLead = {
  businessName?: string;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: {
    line1?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
  } | null;
  source?: string | null;
  sourceUrl?: string | null;
  confidence?: number | null;
  notes?: string | null;
};

function safeString(value: unknown) {
  return typeof value === "string" && value.trim().length ? value.trim() : null;
}

function normalizeLead(raw: AiLead, fallbackName: string): NormalizedLead {
  const businessName = safeString(raw.businessName) ?? fallbackName;
  const website = safeString(raw.website);
  const email = safeString(raw.email);
  const phone = safeString(raw.phone);

  const address = raw.address ?? null;

  return {
    businessName,
    website,
    email,
    phone,
    address: address
      ? {
          line1: safeString(address.line1),
          city: safeString(address.city),
          state: safeString(address.state),
          country: safeString(address.country),
        }
      : null,
    source: safeString(raw.source) ?? "ai-synthesis",
    sourceUrl: safeString(raw.sourceUrl),
    confidence:
      typeof raw.confidence === "number" ? Math.min(Math.max(raw.confidence, 0), 100) : 70,
    notes: safeString(raw.notes),
    raw,
  };
}

const aiSynthesisProvider: LeadProvider<NormalizedLead> = {
  providerId: "ai-synthesis",
  name: "AI Synthesized Leads",
  async search(params) {
    if (!process.env.OPENAI_API_KEY) return [];

    const limit = Math.max(5, Math.min(params.limit ?? 15, 20));
    const prompt = `
You are sourcing high-quality business leads for outreach.
Use multiple channels logically (Google search, LinkedIn company pages, Facebook pages, industry directories) to infer complete contact info.
Only return businesses that match the keyword and context. Prefer leads with a website AND contact signals.
Be precise: do not invent obviously fake data; use best-guess patterns only when reasonable.

Keyword: ${params.keyword}
Context: ${params.context ?? "None"}
Location: ${[params.city, params.state, params.country].filter(Boolean).join(", ") || "Any"}
Target company count: ${limit}

Respond with strict JSON array where each item is:
{
  "businessName": "Name",
  "website": "https://...",
  "email": "contact email if known or best-guess from domain",
  "phone": "international format if available",
  "address": {
    "line1": "street and number",
    "city": "city",
    "state": "state/region",
    "country": "country code or name"
  },
  "source": "primary channel (e.g., linkedin, google-search, facebook, directory)",
  "sourceUrl": "the most credible public page for this lead",
  "confidence": number 0-100 representing how complete/accurate the contact is,
  "notes": "concise why this lead matches"
}
`.trim();

    const content = await runOpenAIChat([
      {
        role: "system",
        content:
          "Return only JSON. Avoid placeholders like N/A, Unknown, or example.com. Prefer real-looking domains, emails, and phone numbers.",
      },
      { role: "user", content: prompt },
    ]);

    let parsed: unknown = null;
    try {
      parsed = JSON.parse(content);
    } catch {
      return [];
    }

    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, limit).map((item, idx) => normalizeLead(item as AiLead, `Lead ${idx + 1}`));
  },
};

export default aiSynthesisProvider;
