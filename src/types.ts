// ─────────────────────────────────────────────────────────────────────────────
// Global TypeScript types for the BlockLot CMS Cloudflare Worker
// ─────────────────────────────────────────────────────────────────────────────

/** Cloudflare Worker environment bindings (matches wrangler.toml). */
export interface Env {
  // KV: block & template definitions
  BLOCKS_KV: KVNamespace;

  // D1: relational data (listings, pages, saved searches)
  DB: D1Database;

  // R2: media assets (listing photos, flyers, logos)
  MEDIA_BUCKET: R2Bucket;

  // Env vars
  RESO_API_BASE_URL: string;
  RESO_API_KEY: string;
  RESO_CLIENT_ID?: string;
  RESO_CLIENT_SECRET?: string;
  ALLOWED_ORIGINS: string;
  SESSION_SECRET?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Blocks
// ─────────────────────────────────────────────────────────────────────────────

export type BlockType =
  | "mortgage-calculator"
  | "listing-card"
  | "listing-gallery"
  | "listing-flyer"
  | "contact-form"
  | "property-search"
  | "agent-profile"
  | "hero-banner"
  | "neighborhood-stats"
  | "open-house-countdown"
  | "testimonials"
  | "custom-html";

export interface Block {
  id: string;
  type: BlockType;
  /** Human-readable label shown in the builder */
  label: string;
  /** User-defined configuration merged into the block renderer */
  config: Record<string, unknown>;
  /** ISO 8601 */
  createdAt: string;
  updatedAt: string;
}

export interface BlockDefinition {
  type: BlockType;
  label: string;
  description: string;
  /** Default config values */
  defaultConfig: Record<string, unknown>;
  /** Renders the block as an HTML string */
  render(config: Record<string, unknown>): string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Templates / Pages
// ─────────────────────────────────────────────────────────────────────────────

export interface TemplatePage {
  id: string;
  name: string;
  slug: string;
  /** Ordered list of block IDs that make up this page */
  blockIds: string[];
  /** Brand / theme variables */
  theme: ThemeConfig;
  createdAt: string;
  updatedAt: string;
}

export interface ThemeConfig {
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  logoUrl?: string;
  companyName: string;
  phone?: string;
  email?: string;
  address?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// RESO Web API / Listings
// ─────────────────────────────────────────────────────────────────────────────

/** Core RESO 2.x Data Dictionary fields for a residential listing. */
export interface ResoListing {
  ListingKey: string;
  ListingId?: string;
  StandardStatus: "Active" | "ActiveUnderContract" | "Pending" | "Closed" | "Expired" | "Withdrawn" | "Hold";
  ListPrice: number;
  OriginalListPrice?: number;
  ClosePrice?: number;
  PropertyType: string;
  PropertySubType?: string;
  StreetNumber?: string;
  StreetName?: string;
  City: string;
  StateOrProvince: string;
  PostalCode: string;
  CountyOrParish?: string;
  BedroomsTotal?: number;
  BathroomsTotalInteger?: number;
  BathroomsFull?: number;
  BathroomsHalf?: number;
  LivingArea?: number;
  LotSizeAcres?: number;
  LotSizeSquareFeet?: number;
  YearBuilt?: number;
  GarageSpaces?: number;
  Latitude?: number;
  Longitude?: number;
  PublicRemarks?: string;
  ListAgentFullName?: string;
  ListAgentEmail?: string;
  ListAgentDirectPhone?: string;
  ListOfficeName?: string;
  Media?: ResoMedia[];
  ModificationTimestamp?: string;
  OnMarketDate?: string;
  DaysOnMarket?: number;
}

export interface ResoMedia {
  MediaKey: string;
  MediaURL: string;
  MediaCategory?: string;
  Order?: number;
  ShortDescription?: string;
}

export interface ResoODataResponse<T> {
  "@odata.context"?: string;
  "@odata.count"?: number;
  "@odata.nextLink"?: string;
  value: T[];
}

// ─────────────────────────────────────────────────────────────────────────────
// HTTP helpers
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiError {
  error: string;
  message: string;
  status: number;
}

export type RouteHandler = (
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  params: Record<string, string>
) => Promise<Response>;
