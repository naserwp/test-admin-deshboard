import osmProvider from "./osm";
import wikidataProvider from "./wikidata";
import googlePlacesProvider from "./googlePlaces";
import yelpProvider from "./yelp";
import opencorporatesProvider from "./opencorporates";
import type { LeadProvider } from "./types";

const optionalProviders = [
  process.env.GOOGLE_PLACES_API_KEY ? googlePlacesProvider : null,
  process.env.YELP_API_KEY ? yelpProvider : null,
  process.env.OPENCORPORATES_API_KEY ? opencorporatesProvider : null,
].filter((provider): provider is LeadProvider => Boolean(provider));

export const leadProviders = [
  osmProvider,
  wikidataProvider,
  ...optionalProviders,
];

export type LeadProviderId = (typeof leadProviders)[number]["id"];

export function getLeadProvider(id: string) {
  return leadProviders.find((provider) => provider.id === id) ?? null;
}
