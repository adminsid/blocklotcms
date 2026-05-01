// ─────────────────────────────────────────────────────────────────────────────
// Lightweight HTTP helper utilities
// ─────────────────────────────────────────────────────────────────────────────

import type { Env } from "./types.js";

/** Return a JSON response with the given status code. */
export function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

/** Return a plain-text error JSON response. */
export function errorResponse(message: string, status = 400): Response {
  return json({ error: true, message, status }, status);
}

/** Return an HTML response. */
export function html(content: string, status = 200): Response {
  return new Response(content, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

/** Build CORS headers based on the ALLOWED_ORIGINS env var. */
export function corsHeaders(env: Env, origin: string | null): Record<string, string> {
  const allowed = env.ALLOWED_ORIGINS === "*"
    ? "*"
    : env.ALLOWED_ORIGINS.split(",").map(s => s.trim()).includes(origin ?? "")
      ? (origin ?? "")
      : "";

  if (!allowed) return {};

  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

/** Handle pre-flight OPTIONS requests. */
export function handleOptions(request: Request, env: Env): Response {
  const origin = request.headers.get("Origin");
  const cors = corsHeaders(env, origin);
  if (Object.keys(cors).length === 0) {
    return new Response("Forbidden", { status: 403 });
  }
  return new Response(null, { status: 204, headers: cors });
}

/** Generate a compact random ID. */
export function generateId(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}

/** Return ISO-8601 UTC timestamp. */
export function now(): string {
  return new Date().toISOString();
}

/** Parse the URL path and extract named segments.
 *
 * @param pattern  e.g. "/api/blocks/:id"
 * @param path     e.g. "/api/blocks/abc123"
 * @returns params object or null if no match
 */
export function matchRoute(
  pattern: string,
  path: string
): Record<string, string> | null {
  const patternParts = pattern.split("/");
  const pathParts = path.split("/");

  if (patternParts.length !== pathParts.length) return null;

  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    const pp = patternParts[i] ?? "";
    const p = pathParts[i] ?? "";
    if (pp.startsWith(":")) {
      params[pp.slice(1)] = decodeURIComponent(p);
    } else if (pp !== p) {
      return null;
    }
  }
  return params;
}
