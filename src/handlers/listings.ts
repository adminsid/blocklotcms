// ─────────────────────────────────────────────────────────────────────────────
// /api/listings  – proxy to the RESO Web API (OData) endpoint
// ─────────────────────────────────────────────────────────────────────────────
//
// The Worker forwards requests to the configured RESO_API_BASE_URL and
// caches responses in the Workers Cache API for 5 minutes to reduce
// upstream API calls.
//
// Real estate data compliance note:
// - Listing data must only be displayed in compliance with MLS rules.
// - Do not cache for longer than permitted by your MLS data agreement.
// - Ensure proper attribution / copyright statements are shown to end users.
// ─────────────────────────────────────────────────────────────────────────────

import type { Env, ResoListing, ResoODataResponse } from "../types.js";
import { errorResponse, json } from "../utils.js";

const CACHE_TTL = 300; // 5 minutes – adjust per MLS data agreement

/** Build the RESO OData query URL from incoming search params. */
function buildResoUrl(base: string, params: URLSearchParams): string {
  const odata = new URLSearchParams();

  // Forward standard OData query options
  for (const key of ["$filter", "$orderby", "$top", "$skip", "$select", "$expand", "$count"]) {
    const v = params.get(key);
    if (v) odata.set(key, v);
  }

  // Convenience shortcuts → OData filter composition
  const filters: string[] = [];
  const existingFilter = params.get("$filter");
  if (existingFilter) filters.push(`(${existingFilter})`);

  if (params.get("q")) {
    const q = params.get("q")!;
    filters.push(
      `(contains(City,'${q}') or contains(PostalCode,'${q}') or contains(StreetName,'${q}'))`
    );
    odata.delete("$filter");
  }
  if (params.get("status")) {
    filters.push(`StandardStatus eq '${params.get("status")}'`);
  }
  if (params.get("type")) {
    filters.push(`PropertyType eq '${params.get("type")}'`);
  }
  if (params.get("minPrice")) {
    filters.push(`ListPrice ge ${params.get("minPrice")}`);
  }
  if (params.get("maxPrice")) {
    filters.push(`ListPrice le ${params.get("maxPrice")}`);
  }
  if (params.get("minBeds")) {
    filters.push(`BedroomsTotal ge ${params.get("minBeds")}`);
  }
  if (params.get("minBaths")) {
    filters.push(`BathroomsTotalInteger ge ${params.get("minBaths")}`);
  }

  if (filters.length > 0) {
    odata.set("$filter", filters.join(" and "));
  }

  // Defaults
  if (!odata.has("$top")) odata.set("$top", params.get("limit") ?? "20");
  if (!odata.has("$orderby")) odata.set("$orderby", "ModificationTimestamp desc");

  // Expand media by default
  if (!odata.has("$expand")) odata.set("$expand", "Media($top=10)");

  return `${base}/Property?${odata.toString()}`;
}

/** Fetch from the RESO API with caching. */
async function fetchReso(
  url: string,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  const cache = caches.default;
  const cacheKey = new Request(url, { method: "GET" });

  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const upstream = await fetch(url, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${env.RESO_API_KEY}`,
    },
  });

  if (!upstream.ok) {
    return new Response(await upstream.text(), {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  const response = new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": `public, max-age=${CACHE_TTL}`,
    },
  });

  ctx.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
}

// ── GET /api/listings ────────────────────────────────────────────────────────
export async function searchListings(
  req: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  const params = new URL(req.url).searchParams;
  const resoUrl = buildResoUrl(env.RESO_API_BASE_URL, params);

  try {
    const upstream = await fetchReso(resoUrl, env, ctx);
    const body = await upstream.json<ResoODataResponse<ResoListing>>();
    return json(body);
  } catch (err) {
    console.error("RESO API error:", err);
    return errorResponse("Failed to fetch listings from RESO API", 502);
  }
}

// ── GET /api/listings/:key ───────────────────────────────────────────────────
export async function getListing(
  _req: Request,
  env: Env,
  ctx: ExecutionContext,
  key: string
): Promise<Response> {
  const url = `${env.RESO_API_BASE_URL}/Property('${encodeURIComponent(key)}')?$expand=Media`;

  try {
    const upstream = await fetchReso(url, env, ctx);
    if (!upstream.ok) return errorResponse("Listing not found", 404);
    const listing = await upstream.json<ResoListing>();
    return json(listing);
  } catch (err) {
    console.error("RESO API error:", err);
    return errorResponse("Failed to fetch listing", 502);
  }
}
