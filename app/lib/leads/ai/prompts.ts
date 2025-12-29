export const LEAD_ENRICH_SYSTEM_PROMPT = `
You are an assistant that enriches business lead data. 
Return only strict JSON with the requested fields and no extra commentary.
`.trim();

export function buildLeadEnrichmentPrompt(input: {
  keyword: string;
  context?: string | null;
  businessName: string;
  website?: string | null;
  address?: string | null;
}) {
  return `
Keyword: ${input.keyword}
Context: ${input.context ?? "-"}
Business: ${input.businessName}
Website: ${input.website ?? "-"}
Address: ${input.address ?? "-"}

Respond with JSON:
{
  "industry": "short category",
  "confidence": number (0-100),
  "email": "real or best-guess email from the domain; leave null if unknown",
  "phone": "international format phone; null if unknown",
  "address": {
    "line1": "street and number if known",
    "city": "city if known",
    "state": "state/region if known",
    "country": "country code or name if known"
  },
  "notes": "one or two short sentences",
  "contactRole": "best guess for decision maker role",
  "ownerName": "best guess if a person's name is apparent"
}
`.trim();
}
