// ─────────────────────────────────────────────────────────────────────────────
// /api/contact  – lead capture endpoint (stores leads in D1)
// ─────────────────────────────────────────────────────────────────────────────

import type { Env } from "../types.js";
import { errorResponse, generateId, json, now } from "../utils.js";

interface LeadPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  message?: string;
  listingKey?: string;
  showingDate?: string;
  consent?: boolean | string;
}

// ── POST /api/contact ────────────────────────────────────────────────────────
export async function submitContact(req: Request, env: Env): Promise<Response> {
  let body: LeadPayload;
  try {
    body = (await req.json()) as LeadPayload;
  } catch {
    return errorResponse("Invalid JSON body");
  }

  if (!body.email) return errorResponse("'email' is required");
  if (!body.firstName) return errorResponse("'firstName' is required");
  if (!body.lastName) return errorResponse("'lastName' is required");

  // Basic email sanity check (not a full RFC validation, just a quick guard)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return errorResponse("Invalid email address");
  }

  const id = generateId();
  const ts = now();

  await env.DB.prepare(
    `INSERT INTO leads
       (id, first_name, last_name, email, phone, message, listing_key, showing_date, consent, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    body.firstName,
    body.lastName,
    body.email,
    body.phone ?? null,
    body.message ?? null,
    body.listingKey ?? null,
    body.showingDate ?? null,
    body.consent ? 1 : 0,
    ts
  ).run();

  return json({ success: true, id, createdAt: ts }, 201);
}

// ── GET /api/contact (list leads – protected, basic check) ───────────────────
export async function listLeads(req: Request, env: Env): Promise<Response> {
  // Simple bearer-token guard – replace with proper auth in production
  const auth = req.headers.get("Authorization") ?? "";
  const expected = `Bearer ${env.SESSION_SECRET ?? ""}`;
  if (!env.SESSION_SECRET || auth !== expected) {
    return errorResponse("Unauthorized", 401);
  }

  const result = await env.DB.prepare(
    "SELECT * FROM leads ORDER BY created_at DESC LIMIT 200"
  ).all();

  return json(result.results ?? []);
}
