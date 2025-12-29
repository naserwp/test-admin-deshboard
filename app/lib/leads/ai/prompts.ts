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
  "notes": "one or two short sentences, include any email guess if helpful",
  "contactRole": "best guess for decision maker role",
  "ownerName": "best guess if a person's name is apparent"
}
`.trim();
}
