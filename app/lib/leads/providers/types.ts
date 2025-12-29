import type { NormalizedLead } from "../types";

export type LeadSearchParams = {
  keyword: string;
  context?: string | null;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  industry?: string | null;
  size?: string | null;
  limit?: number;
};

export interface LeadProvider<TRaw = unknown> {
  providerId?: string;
  id?: string;
  name: string;
  search: (params: LeadSearchParams) => Promise<TRaw[] | NormalizedLead[]>;
  normalize?: (raw: TRaw) => NormalizedLead | null;
  enrich?: (lead: NormalizedLead) => Promise<NormalizedLead>;
}
