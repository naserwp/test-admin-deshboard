export type LeadAddress = {
  line1?: string | null;
  line2?: string | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  postcode?: string | null;
  country?: string | null;
};

export type NormalizedLead = {
  businessName: string;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: LeadAddress | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  source: string;
  sourceUrl?: string | null;
  industry?: string | null;
  contactFirstName?: string | null;
  contactLastName?: string | null;
  contactRole?: string | null;
  contactEmail?: string | null;
  ownerName?: string | null;
  ein?: string | null;
  businessCapital?: string | null;
  employeeCount?: number | null;
  confidence?: number | null;
  notes?: string | null;
  raw?: unknown;
};
