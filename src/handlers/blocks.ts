// ─────────────────────────────────────────────────────────────────────────────
// /api/blocks  – CRUD for saved block instances (stored in KV)
// ─────────────────────────────────────────────────────────────────────────────

import type { Block, BlockType, Env } from "../types.js";
import { errorResponse, generateId, json, now } from "../utils.js";
import { getBlockDefinition, listBlockDefinitions, renderBlock } from "../blocks/index.js";

// ── GET /api/blocks ──────────────────────────────────────────────────────────
export async function listBlocks(_req: Request, env: Env): Promise<Response> {
  const list = await env.BLOCKS_KV.list({ prefix: "block:" });
  const blocks: Block[] = await Promise.all(
    list.keys.map(async k => {
      const raw = await env.BLOCKS_KV.get(k.name);
      return raw ? (JSON.parse(raw) as Block) : null;
    })
  ).then(arr => arr.filter((b): b is Block => b !== null));
  return json(blocks);
}

// ── GET /api/blocks/definitions ──────────────────────────────────────────────
export async function listDefinitions(_req: Request, _env: Env): Promise<Response> {
  const defs = listBlockDefinitions().map(d => ({
    type: d.type,
    label: d.label,
    description: d.description,
    defaultConfig: d.defaultConfig,
  }));
  return json(defs);
}

// ── GET /api/blocks/:id ──────────────────────────────────────────────────────
export async function getBlock(
  _req: Request,
  env: Env,
  id: string
): Promise<Response> {
  const raw = await env.BLOCKS_KV.get(`block:${id}`);
  if (!raw) return errorResponse("Block not found", 404);
  return json(JSON.parse(raw));
}

// ── POST /api/blocks ─────────────────────────────────────────────────────────
export async function createBlock(req: Request, env: Env): Promise<Response> {
  let body: Partial<Block>;
  try {
    body = (await req.json()) as Partial<Block>;
  } catch {
    return errorResponse("Invalid JSON body");
  }

  if (!body.type) return errorResponse("'type' is required");
  const def = getBlockDefinition(body.type as BlockType);
  if (!def) return errorResponse(`Unknown block type: ${body.type}`);

  const block: Block = {
    id: generateId(),
    type: body.type as BlockType,
    label: body.label ?? def.label,
    config: { ...def.defaultConfig, ...(body.config ?? {}) },
    createdAt: now(),
    updatedAt: now(),
  };

  await env.BLOCKS_KV.put(`block:${block.id}`, JSON.stringify(block));
  return json(block, 201);
}

// ── PUT /api/blocks/:id ──────────────────────────────────────────────────────
export async function updateBlock(
  req: Request,
  env: Env,
  id: string
): Promise<Response> {
  const raw = await env.BLOCKS_KV.get(`block:${id}`);
  if (!raw) return errorResponse("Block not found", 404);

  let body: Partial<Block>;
  try {
    body = (await req.json()) as Partial<Block>;
  } catch {
    return errorResponse("Invalid JSON body");
  }

  const existing = JSON.parse(raw) as Block;
  const updated: Block = {
    ...existing,
    label: body.label ?? existing.label,
    config: body.config != null ? { ...existing.config, ...body.config } : existing.config,
    updatedAt: now(),
  };

  await env.BLOCKS_KV.put(`block:${id}`, JSON.stringify(updated));
  return json(updated);
}

// ── DELETE /api/blocks/:id ───────────────────────────────────────────────────
export async function deleteBlock(
  _req: Request,
  env: Env,
  id: string
): Promise<Response> {
  const raw = await env.BLOCKS_KV.get(`block:${id}`);
  if (!raw) return errorResponse("Block not found", 404);
  await env.BLOCKS_KV.delete(`block:${id}`);
  return json({ deleted: true, id });
}

// ── GET /api/blocks/:id/render ───────────────────────────────────────────────
export async function renderBlockById(
  _req: Request,
  env: Env,
  id: string
): Promise<Response> {
  const raw = await env.BLOCKS_KV.get(`block:${id}`);
  if (!raw) return errorResponse("Block not found", 404);
  const block = JSON.parse(raw) as Block;
  const html = renderBlock(block.type, block.config);
  return new Response(html, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
}
