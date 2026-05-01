// ─────────────────────────────────────────────────────────────────────────────
// Block registry — single place that maps BlockType → BlockDefinition
// ─────────────────────────────────────────────────────────────────────────────

import type { BlockDefinition, BlockType } from "../types.js";

import mortgageCalculator from "./mortgage-calculator.js";
import listingCard from "./listing-card.js";
import listingGallery from "./listing-gallery.js";
import propertysearch from "./property-search.js";
import contactForm from "./contact-form.js";
import listingFlyer from "./listing-flyer.js";
import agentProfile from "./agent-profile.js";
import heroBanner from "./hero-banner.js";
import openHouseCountdown from "./open-house-countdown.js";
import neighborhoodStats from "./neighborhood-stats.js";

const ALL_BLOCKS: BlockDefinition[] = [
  mortgageCalculator,
  listingCard,
  listingGallery,
  propertysearch,
  contactForm,
  listingFlyer,
  agentProfile,
  heroBanner,
  openHouseCountdown,
  neighborhoodStats,
];

const registry = new Map<BlockType, BlockDefinition>(
  ALL_BLOCKS.map(b => [b.type, b])
);

export function getBlockDefinition(type: BlockType): BlockDefinition | undefined {
  return registry.get(type);
}

export function listBlockDefinitions(): BlockDefinition[] {
  return ALL_BLOCKS;
}

export function renderBlock(type: BlockType, config: Record<string, unknown>): string {
  const def = registry.get(type);
  if (!def) {
    return `<div style="color:red;padding:1rem">Unknown block type: ${type}</div>`;
  }
  return def.render({ ...def.defaultConfig, ...config });
}
