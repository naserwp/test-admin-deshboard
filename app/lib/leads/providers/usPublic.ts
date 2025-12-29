import type { LeadProvider, LeadSearchParams } from "./types";
import type { NormalizedLead } from "../types";

// Placeholder US public data provider. Returns empty results but keeps the channel wired.
const usPublicProvider: LeadProvider<NormalizedLead> = {
  providerId: "us-public",
  name: "US Public Data",
  async search(_params: LeadSearchParams) {
    return [];
  },
};

export default usPublicProvider;
