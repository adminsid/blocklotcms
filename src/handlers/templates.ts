// ─────────────────────────────────────────────────────────────────────────────
// /api/templates  – CRUD for page templates (stored in D1)
// ─────────────────────────────────────────────────────────────────────────────

import type { Env, TemplatePage, ThemeConfig } from "../types.js";
import { errorResponse, generateId, json, now } from "../utils.js";

// ── GET /api/templates ───────────────────────────────────────────────────────
export async function listTemplates(_req: Request, env: Env): Promise<Response> {
  const result = await env.DB.prepare(
    "SELECT id, name, slug, block_ids, theme, created_at, updated_at FROM pages ORDER BY created_at DESC"
  ).all<{
    id: string; name: string; slug: string;
    block_ids: string; theme: string;
    created_at: string; updated_at: string;
  }>();

  const pages = (result.results ?? []).map(row => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    blockIds: JSON.parse(row.block_ids) as string[],
    theme: JSON.parse(row.theme) as ThemeConfig,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  return json(pages);
}

// ── GET /api/templates/:id ───────────────────────────────────────────────────
export async function getTemplate(
  _req: Request,
  env: Env,
  id: string
): Promise<Response> {
  const row = await env.DB.prepare(
    "SELECT id, name, slug, block_ids, theme, created_at, updated_at FROM pages WHERE id = ?"
  ).bind(id).first<{
    id: string; name: string; slug: string;
    block_ids: string; theme: string;
    created_at: string; updated_at: string;
  }>();

  if (!row) return errorResponse("Template not found", 404);

  return json({
    id: row.id,
    name: row.name,
    slug: row.slug,
    blockIds: JSON.parse(row.block_ids) as string[],
    theme: JSON.parse(row.theme) as ThemeConfig,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

// ── POST /api/templates ──────────────────────────────────────────────────────
export async function createTemplate(req: Request, env: Env): Promise<Response> {
  let body: Partial<TemplatePage>;
  try {
    body = (await req.json()) as Partial<TemplatePage>;
  } catch {
    return errorResponse("Invalid JSON body");
  }

  if (!body.name) return errorResponse("'name' is required");
  if (!body.slug) return errorResponse("'slug' is required");

  const id = generateId();
  const ts = now();
  const blockIds = body.blockIds ?? [];
  const theme: ThemeConfig = {
    primaryColor: "#1a56db",
    accentColor: "#f59e0b",
    fontFamily: "system-ui, sans-serif",
    companyName: "Your Realty",
    ...(body.theme ?? {}),
  };

  await env.DB.prepare(
    "INSERT INTO pages (id, name, slug, block_ids, theme, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).bind(id, body.name, body.slug, JSON.stringify(blockIds), JSON.stringify(theme), ts, ts).run();

  return json({ id, name: body.name, slug: body.slug, blockIds, theme, createdAt: ts, updatedAt: ts }, 201);
}

// ── PUT /api/templates/:id ───────────────────────────────────────────────────
export async function updateTemplate(
  req: Request,
  env: Env,
  id: string
): Promise<Response> {
  const existing = await env.DB.prepare(
    "SELECT id, name, slug, block_ids, theme FROM pages WHERE id = ?"
  ).bind(id).first<{ id: string; name: string; slug: string; block_ids: string; theme: string }>();

  if (!existing) return errorResponse("Template not found", 404);

  let body: Partial<TemplatePage>;
  try {
    body = (await req.json()) as Partial<TemplatePage>;
  } catch {
    return errorResponse("Invalid JSON body");
  }

  const name = body.name ?? existing.name;
  const slug = body.slug ?? existing.slug;
  const blockIds = body.blockIds ?? (JSON.parse(existing.block_ids) as string[]);
  const theme = body.theme != null
    ? { ...(JSON.parse(existing.theme) as ThemeConfig), ...body.theme }
    : (JSON.parse(existing.theme) as ThemeConfig);
  const ts = now();

  await env.DB.prepare(
    "UPDATE pages SET name = ?, slug = ?, block_ids = ?, theme = ?, updated_at = ? WHERE id = ?"
  ).bind(name, slug, JSON.stringify(blockIds), JSON.stringify(theme), ts, id).run();

  return json({ id, name, slug, blockIds, theme, updatedAt: ts });
}

// ── DELETE /api/templates/:id ────────────────────────────────────────────────
export async function deleteTemplate(
  _req: Request,
  env: Env,
  id: string
): Promise<Response> {
  const existing = await env.DB.prepare("SELECT id FROM pages WHERE id = ?").bind(id).first();
  if (!existing) return errorResponse("Template not found", 404);
  await env.DB.prepare("DELETE FROM pages WHERE id = ?").bind(id).run();
  return json({ deleted: true, id });
}
