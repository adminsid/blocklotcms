// ─────────────────────────────────────────────────────────────────────────────
// Integration tests: Worker HTTP API (uses @cloudflare/vitest-pool-workers)
// ─────────────────────────────────────────────────────────────────────────────
import { env, SELF } from "cloudflare:test";
import { describe, it, expect, beforeAll } from "vitest";

// Initialise D1 schema before tests
beforeAll(async () => {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS pages (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE,
    block_ids TEXT NOT NULL DEFAULT '[]', theme TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL
  )`).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY, first_name TEXT NOT NULL, last_name TEXT NOT NULL,
    email TEXT NOT NULL, phone TEXT, message TEXT,
    listing_key TEXT, showing_date TEXT, consent INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  )`).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS saved_searches (
    id TEXT PRIMARY KEY, label TEXT NOT NULL, query TEXT NOT NULL,
    user_email TEXT, created_at TEXT NOT NULL
  )`).run();
});

// ── Health check ──────────────────────────────────────────────────────────────
describe("GET /api/health", () => {
  it("returns 200 with status ok", async () => {
    const res = await SELF.fetch("https://example.com/api/health");
    expect(res.status).toBe(200);
    const body = await res.json<{ status: string }>();
    expect(body.status).toBe("ok");
  });
});

// ── Root page ─────────────────────────────────────────────────────────────────
describe("GET /", () => {
  it("serves the landing HTML", async () => {
    const res = await SELF.fetch("https://example.com/");
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/html");
    const text = await res.text();
    expect(text).toContain("BlockLot CMS");
  });
});

// ── Builder UI ────────────────────────────────────────────────────────────────
describe("GET /builder", () => {
  it("serves the builder HTML with block definitions", async () => {
    const res = await SELF.fetch("https://example.com/builder");
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("mortgage-calculator");
    expect(text).toContain("listing-card");
  });
});

// ── Block definitions ─────────────────────────────────────────────────────────
describe("GET /api/blocks/definitions", () => {
  it("returns all block definitions", async () => {
    const res = await SELF.fetch("https://example.com/api/blocks/definitions");
    expect(res.status).toBe(200);
    const body = await res.json<Array<{ type: string }>>();
    expect(Array.isArray(body)).toBe(true);
    const types = body.map(d => d.type);
    expect(types).toContain("mortgage-calculator");
    expect(types).toContain("listing-card");
    expect(types).toContain("contact-form");
  });
});

// ── Blocks CRUD ───────────────────────────────────────────────────────────────
describe("Blocks API", () => {
  it("full CRUD lifecycle for a block", async () => {
    // CREATE
    const createRes = await SELF.fetch("https://example.com/api/blocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "hero-banner", label: "Test Hero", config: { headline: "Test Headline" } }),
    });
    expect(createRes.status).toBe(201);
    const created = await createRes.json<{ id: string; type: string; config: { headline: string } }>();
    expect(created.type).toBe("hero-banner");
    expect(created.config.headline).toBe("Test Headline");
    const id = created.id;

    // READ
    const getRes = await SELF.fetch(`https://example.com/api/blocks/${id}`);
    expect(getRes.status).toBe(200);
    const got = await getRes.json<{ id: string }>();
    expect(got.id).toBe(id);

    // LIST
    const listRes = await SELF.fetch("https://example.com/api/blocks");
    expect(listRes.status).toBe(200);
    const list = await listRes.json<unknown[]>();
    expect(Array.isArray(list)).toBe(true);

    // UPDATE
    const updateRes = await SELF.fetch(`https://example.com/api/blocks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ config: { headline: "Updated Headline" } }),
    });
    expect(updateRes.status).toBe(200);
    const updated = await updateRes.json<{ config: { headline: string } }>();
    expect(updated.config.headline).toBe("Updated Headline");

    // RENDER
    const renderRes = await SELF.fetch(`https://example.com/api/blocks/${id}/render`);
    expect(renderRes.status).toBe(200);
    expect(renderRes.headers.get("Content-Type")).toContain("text/html");
    const renderText = await renderRes.text();
    expect(renderText).toContain("blk-hero");

    // DELETE
    const deleteRes = await SELF.fetch(`https://example.com/api/blocks/${id}`, { method: "DELETE" });
    expect(deleteRes.status).toBe(200);
    const deleted = await deleteRes.json<{ deleted: boolean }>();
    expect(deleted.deleted).toBe(true);

    // CONFIRM DELETED
    const gone = await SELF.fetch(`https://example.com/api/blocks/${id}`);
    expect(gone.status).toBe(404);
  });
});

// ── POST /api/blocks validation ───────────────────────────────────────────────
describe("Block creation validation", () => {
  it("returns 400 when type is missing", async () => {
    const res = await SELF.fetch("https://example.com/api/blocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: "No type" }),
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 for unknown block type", async () => {
    const res = await SELF.fetch("https://example.com/api/blocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "not-a-real-type" }),
    });
    expect(res.status).toBe(400);
  });
});

// ── Templates CRUD ────────────────────────────────────────────────────────────
describe("Templates API", () => {
  it("full CRUD lifecycle for a template", async () => {
    // CREATE
    const createRes = await SELF.fetch("https://example.com/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Page",
        slug: "test-page-lifecycle",
        blockIds: [],
        theme: { companyName: "Test Realty", primaryColor: "#ff0000" },
      }),
    });
    expect(createRes.status).toBe(201);
    const created = await createRes.json<{ id: string; slug: string; theme: { primaryColor: string } }>();
    expect(created.slug).toBe("test-page-lifecycle");
    const id = created.id;

    // LIST
    const listRes = await SELF.fetch("https://example.com/api/templates");
    expect(listRes.status).toBe(200);
    const list = await listRes.json<unknown[]>();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThanOrEqual(1);

    // READ
    const getRes = await SELF.fetch(`https://example.com/api/templates/${id}`);
    expect(getRes.status).toBe(200);
    const got = await getRes.json<{ name: string; theme: { primaryColor: string } }>();
    expect(got.name).toBe("Test Page");
    expect(got.theme.primaryColor).toBe("#ff0000");

    // UPDATE
    const updateRes = await SELF.fetch(`https://example.com/api/templates/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Updated Page" }),
    });
    expect(updateRes.status).toBe(200);
    const updated = await updateRes.json<{ name: string }>();
    expect(updated.name).toBe("Updated Page");

    // DELETE
    const deleteRes = await SELF.fetch(`https://example.com/api/templates/${id}`, { method: "DELETE" });
    expect(deleteRes.status).toBe(200);
    const deleted = await deleteRes.json<{ deleted: boolean }>();
    expect(deleted.deleted).toBe(true);
  });
});

// ── Template validation ───────────────────────────────────────────────────────
describe("Template creation validation", () => {
  it("returns 400 when name is missing", async () => {
    const res = await SELF.fetch("https://example.com/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: "no-name" }),
    });
    expect(res.status).toBe(400);
  });
});

// ── Contact form ──────────────────────────────────────────────────────────────
describe("POST /api/contact", () => {
  it("accepts a valid lead submission", async () => {
    const res = await SELF.fetch("https://example.com/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: "Jane",
        lastName: "Buyer",
        email: "jane@example.com",
        message: "Interested in listing L001",
        consent: true,
      }),
    });
    expect(res.status).toBe(201);
    const body = await res.json<{ success: boolean }>();
    expect(body.success).toBe(true);
  });

  it("returns 400 when email is missing", async () => {
    const res = await SELF.fetch("https://example.com/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName: "Jane", lastName: "Buyer" }),
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid email format", async () => {
    const res = await SELF.fetch("https://example.com/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName: "Jane", lastName: "Buyer", email: "not-an-email" }),
    });
    expect(res.status).toBe(400);
  });

  it("GET /api/contact returns 401 without auth", async () => {
    const res = await SELF.fetch("https://example.com/api/contact");
    expect(res.status).toBe(401);
  });
});

// ── 404 & method not allowed ──────────────────────────────────────────────────
describe("Error handling", () => {
  it("returns 404 for unknown routes", async () => {
    const res = await SELF.fetch("https://example.com/api/does-not-exist");
    expect(res.status).toBe(404);
  });

  it("returns 405 for wrong HTTP method", async () => {
    const res = await SELF.fetch("https://example.com/api/health", { method: "DELETE" });
    expect(res.status).toBe(405);
  });
});

// ── CORS headers ──────────────────────────────────────────────────────────────
describe("CORS", () => {
  it("returns CORS headers on API responses", async () => {
    const res = await SELF.fetch("https://example.com/api/health", {
      headers: { Origin: "https://app.example.com" },
    });
    // ALLOWED_ORIGINS is '*' in test env
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });

  it("handles OPTIONS pre-flight", async () => {
    const res = await SELF.fetch("https://example.com/api/blocks", {
      method: "OPTIONS",
      headers: {
        Origin: "https://app.example.com",
        "Access-Control-Request-Method": "POST",
      },
    });
    expect(res.status).toBe(204);
  });
});
