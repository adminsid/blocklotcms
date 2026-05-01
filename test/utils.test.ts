// ─────────────────────────────────────────────────────────────────────────────
// Unit tests: utility functions
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect } from "vitest";
import { matchRoute, generateId, now } from "../src/utils.js";

describe("matchRoute", () => {
  it("matches a static path", () => {
    expect(matchRoute("/api/health", "/api/health")).toEqual({});
  });

  it("matches a parameterised path", () => {
    expect(matchRoute("/api/blocks/:id", "/api/blocks/abc123")).toEqual({ id: "abc123" });
  });

  it("returns null when segment count differs", () => {
    expect(matchRoute("/api/blocks/:id", "/api/blocks")).toBeNull();
  });

  it("returns null on mismatch", () => {
    expect(matchRoute("/api/blocks", "/api/templates")).toBeNull();
  });

  it("URL-decodes param values", () => {
    const result = matchRoute("/pages/:slug", "/pages/my%20page");
    expect(result).toEqual({ slug: "my page" });
  });
});

describe("generateId", () => {
  it("returns a 16-char hex string", () => {
    const id = generateId();
    expect(id).toHaveLength(16);
    expect(id).toMatch(/^[0-9a-f]+$/);
  });

  it("generates unique IDs", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});

describe("now", () => {
  it("returns a valid ISO-8601 string", () => {
    const ts = now();
    expect(() => new Date(ts)).not.toThrow();
    expect(new Date(ts).toISOString()).toBe(ts);
  });
});
