type ExportValue = string | number | boolean | null | undefined;

export function toCsvRow(values: ExportValue[]) {
  return values
    .map((value) => {
      const raw = value === null || value === undefined ? "" : String(value);
      if (/[\",\n]/.test(raw)) {
        return `"${raw.replace(/\"/g, "\"\"")}"`;
      }
      return raw;
    })
    .join(",");
}

type LeadExportRow = {
  businessName: string;
  industry?: string | null;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  source?: string | null;
  sourceUrl?: string | null;
  confidence?: number | null;
  notes?: string | null;
};

export function buildLeadResultsCsv(results: LeadExportRow[]) {
  const header = toCsvRow([
    "Business Name",
    "Industry",
    "Website",
    "Phone",
    "Email",
    "Address Line 1",
    "Address Line 2",
    "City",
    "State",
    "Postal Code",
    "Country",
    "Source",
    "Source URL",
    "Confidence",
    "Notes",
  ]);

  const rows = results.map((result) =>
    toCsvRow([
      result.businessName,
      result.industry,
      result.website,
      result.phone,
      result.email,
      result.addressLine1,
      result.addressLine2,
      result.city,
      result.state,
      result.postalCode,
      result.country,
      result.source,
      result.sourceUrl,
      result.confidence,
      result.notes,
    ])
  );

  return [header, ...rows].join("\n");
}
