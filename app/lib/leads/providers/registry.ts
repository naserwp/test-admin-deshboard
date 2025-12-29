import type { LeadProvider } from "./types";
import osmProvider from "./osm";
import osmOverpassProvider from "./osmOverpass";
import googlePlacesProvider from "./googlePlaces";
import yelpProvider from "./yelp";
import opencorporatesProvider from "./opencorporates";
import wikidataProvider from "./wikidata";
import aiSynthesisProvider from "./aiSynthesis";
import serpProvider from "./serp";
import gleifProvider from "./gleif";
import usPublicProvider from "./usPublic";

type ProviderRecord = LeadProvider & {
  providerId: string;
  enabled: boolean;
};

const registry = new Map<string, ProviderRecord>();

function resolveProviderId(provider: LeadProvider) {
  const id = provider.providerId ?? provider.id;
  if (!id) {
    throw new Error("Provider must define providerId or id.");
  }
  return id;
}

export function registerProvider(provider: LeadProvider, enabled = true) {
  const providerId = resolveProviderId(provider);
  registry.set(providerId, {
    ...provider,
    providerId,
    enabled,
  });
}

export function enableProvider(providerId: string) {
  const record = registry.get(providerId);
  if (record) {
    registry.set(providerId, { ...record, enabled: true });
  }
}

export function disableProvider(providerId: string) {
  const record = registry.get(providerId);
  if (record) {
    registry.set(providerId, { ...record, enabled: false });
  }
}

export function getProvider(providerId: string) {
  return registry.get(providerId) ?? null;
}

export function listProviders() {
  return Array.from(registry.values());
}

export function listEnabledProviders() {
  return Array.from(registry.values()).filter((provider) => provider.enabled);
}

registerProvider(osmOverpassProvider, true);
registerProvider(osmProvider, true);
registerProvider(wikidataProvider, true);
registerProvider(gleifProvider, true);
registerProvider(usPublicProvider, true);
if (process.env.GOOGLE_PLACES_API_KEY) {
  registerProvider(googlePlacesProvider, true);
}
if (process.env.YELP_API_KEY) {
  registerProvider(yelpProvider, true);
}
if (process.env.OPENCORPORATES_API_KEY) {
  registerProvider(opencorporatesProvider, true);
}
if (process.env.OPENAI_API_KEY) {
  registerProvider(aiSynthesisProvider, true);
}
if (process.env.SERP_API_KEY) {
  registerProvider(serpProvider, true);
}
