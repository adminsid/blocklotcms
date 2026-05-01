// ─────────────────────────────────────────────────────────────────────────────
// Request router  –  maps (method, pathname) → handler
// ─────────────────────────────────────────────────────────────────────────────

import type { Env } from "./types.js";
import { corsHeaders, errorResponse, handleOptions, matchRoute } from "./utils.js";

// Handlers
import {
  listBlocks, listDefinitions, getBlock, createBlock,
  updateBlock, deleteBlock, renderBlockById,
} from "./handlers/blocks.js";
import {
  listTemplates, getTemplate, createTemplate,
  updateTemplate, deleteTemplate,
} from "./handlers/templates.js";
import { searchListings, getListing } from "./handlers/listings.js";
import { uploadMedia, getMedia, deleteMedia } from "./handlers/media.js";
import { submitContact, listLeads } from "./handlers/contact.js";
import { builderHtml } from "./ui/builder.js";
import { renderPage } from "./ui/page-renderer.js";
import { listBlockDefinitions } from "./blocks/index.js";
import { html } from "./utils.js";

export async function router(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method.toUpperCase();

  // ── CORS pre-flight ──────────────────────────────────────────────────────
  if (method === "OPTIONS") return handleOptions(request, env);

  // ── Apply CORS to every response ─────────────────────────────────────────
  const origin = request.headers.get("Origin");
  const cors = corsHeaders(env, origin);

  function withCors(response: Response): Response {
    if (Object.keys(cors).length === 0) return response;
    const res = new Response(response.body, response);
    for (const [k, v] of Object.entries(cors)) res.headers.set(k, v);
    return res;
  }

  async function handle(): Promise<Response> {
    // ── Builder UI ───────────────────────────────────────────────────────
    if (path === "/builder" || path === "/builder/") {
      if (method !== "GET") return errorResponse("Method Not Allowed", 405);
      return html(builderHtml(listBlockDefinitions()));
    }

    // ── Rendered pages ───────────────────────────────────────────────────
    const pageMatch = matchRoute("/pages/:slug", path);
    if (pageMatch) {
      if (method !== "GET") return errorResponse("Method Not Allowed", 405);
      return renderPage(env, pageMatch["slug"]!);
    }

    // ── Listings ─────────────────────────────────────────────────────────
    if (path === "/api/listings") {
      if (method === "GET") return searchListings(request, env, ctx);
      return errorResponse("Method Not Allowed", 405);
    }
    const listingMatch = matchRoute("/api/listings/:key", path);
    if (listingMatch) {
      if (method === "GET") return getListing(request, env, ctx, listingMatch["key"]!);
      return errorResponse("Method Not Allowed", 405);
    }

    // ── Blocks ───────────────────────────────────────────────────────────
    if (path === "/api/blocks/definitions") {
      if (method === "GET") return listDefinitions(request, env);
      return errorResponse("Method Not Allowed", 405);
    }
    if (path === "/api/blocks") {
      if (method === "GET") return listBlocks(request, env);
      if (method === "POST") return createBlock(request, env);
      return errorResponse("Method Not Allowed", 405);
    }
    const blockRenderMatch = matchRoute("/api/blocks/:id/render", path);
    if (blockRenderMatch) {
      if (method === "GET") return renderBlockById(request, env, blockRenderMatch["id"]!);
      return errorResponse("Method Not Allowed", 405);
    }
    const blockMatch = matchRoute("/api/blocks/:id", path);
    if (blockMatch) {
      if (method === "GET") return getBlock(request, env, blockMatch["id"]!);
      if (method === "PUT") return updateBlock(request, env, blockMatch["id"]!);
      if (method === "DELETE") return deleteBlock(request, env, blockMatch["id"]!);
      return errorResponse("Method Not Allowed", 405);
    }

    // ── Templates ────────────────────────────────────────────────────────
    if (path === "/api/templates") {
      if (method === "GET") return listTemplates(request, env);
      if (method === "POST") return createTemplate(request, env);
      return errorResponse("Method Not Allowed", 405);
    }
    const templateMatch = matchRoute("/api/templates/:id", path);
    if (templateMatch) {
      if (method === "GET") return getTemplate(request, env, templateMatch["id"]!);
      if (method === "PUT") return updateTemplate(request, env, templateMatch["id"]!);
      if (method === "DELETE") return deleteTemplate(request, env, templateMatch["id"]!);
      return errorResponse("Method Not Allowed", 405);
    }

    // ── Media (R2) ───────────────────────────────────────────────────────
    if (path === "/api/media") {
      if (method === "POST") return uploadMedia(request, env);
      return errorResponse("Method Not Allowed", 405);
    }
    // /api/media/media/abc123.jpg  (key includes the "media/" prefix)
    if (path.startsWith("/api/media/")) {
      const key = path.slice("/api/media/".length);
      if (!key) return errorResponse("Media key required", 400);
      if (method === "GET") return getMedia(request, env, key);
      if (method === "DELETE") return deleteMedia(request, env, key);
      return errorResponse("Method Not Allowed", 405);
    }

    // ── Contact / Leads ──────────────────────────────────────────────────
    if (path === "/api/contact") {
      if (method === "POST") return submitContact(request, env);
      if (method === "GET") return listLeads(request, env);
      return errorResponse("Method Not Allowed", 405);
    }

    // ── Health check ─────────────────────────────────────────────────────
    if (path === "/api/health") {
      if (method !== "GET") return errorResponse("Method Not Allowed", 405);
      return new Response(JSON.stringify({ status: "ok", ts: new Date().toISOString() }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // ── Root ─────────────────────────────────────────────────────────────
    if (path === "/" || path === "") {
      return html(indexHtml());
    }

    return errorResponse("Not Found", 404);
  }

  return withCors(await handle());
}

function indexHtml(): string {
  return /* html */`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>BlockLot CMS</title>
<style>
body{margin:0;font-family:system-ui,sans-serif;background:#0f172a;color:#f1f5f9;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;gap:1.5rem;padding:2rem;text-align:center}
h1{font-size:2.25rem;font-weight:800;margin:0}
p{color:#94a3b8;max-width:540px;line-height:1.6;margin:0}
a.btn{display:inline-block;background:#3b82f6;color:#fff;text-decoration:none;padding:.65rem 1.5rem;border-radius:8px;font-weight:700;margin:.25rem;transition:opacity .15s}
a.btn:hover{opacity:.85}
a.btn--secondary{background:#334155}
pre{background:#1e293b;padding:1rem 1.5rem;border-radius:8px;font-size:.8rem;text-align:left;overflow-x:auto;max-width:640px;width:100%}
</style>
</head>
<body>
<h1>🏠 BlockLot CMS</h1>
<p>Cloudflare Worker-based real estate website builder with RESO Web API integration, reusable blocks, and a drag-and-drop page builder.</p>
<div>
  <a class="btn" href="/builder">Open Builder</a>
  <a class="btn btn--secondary" href="/api/health">Health Check</a>
  <a class="btn btn--secondary" href="/api/blocks/definitions">Block Definitions</a>
</div>
<pre>Available API Endpoints:
GET  /builder                    – Visual page builder UI
GET  /pages/:slug                – Rendered page

GET  /api/blocks/definitions     – List all block types
GET  /api/blocks                 – List saved blocks
POST /api/blocks                 – Create a block
GET  /api/blocks/:id             – Get a block
PUT  /api/blocks/:id             – Update a block
DEL  /api/blocks/:id             – Delete a block
GET  /api/blocks/:id/render      – Render block as HTML

GET  /api/templates              – List pages/templates
POST /api/templates              – Create a page
GET  /api/templates/:id          – Get a page
PUT  /api/templates/:id          – Update a page
DEL  /api/templates/:id          – Delete a page

GET  /api/listings               – Search MLS listings (RESO OData)
GET  /api/listings/:key          – Get single listing by ListingKey

POST /api/media                  – Upload media to R2
GET  /api/media/:key             – Retrieve media from R2
DEL  /api/media/:key             – Delete media from R2

POST /api/contact                – Submit a lead / contact form
GET  /api/contact                – List leads (requires auth)

GET  /api/health                 – Health check</pre>
</body>
</html>`;
}
