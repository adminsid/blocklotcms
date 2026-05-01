-- BlockLot CMS – D1 database schema
-- Apply with: wrangler d1 migrations apply blocklotcms-db

-- ── Pages / Templates ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pages (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  block_ids   TEXT NOT NULL DEFAULT '[]',   -- JSON array of block KV keys
  theme       TEXT NOT NULL DEFAULT '{}',   -- JSON ThemeConfig
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS pages_slug_idx ON pages (slug);

-- ── Leads / Contact form submissions ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id            TEXT PRIMARY KEY,
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT,
  message       TEXT,
  listing_key   TEXT,                        -- RESO ListingKey if applicable
  showing_date  TEXT,                        -- ISO date requested
  consent       INTEGER NOT NULL DEFAULT 0, -- 1 = opted in
  created_at    TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS leads_email_idx ON leads (email);
CREATE INDEX IF NOT EXISTS leads_listing_idx ON leads (listing_key);

-- ── Saved MLS searches ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_searches (
  id         TEXT PRIMARY KEY,
  label      TEXT NOT NULL,
  query      TEXT NOT NULL,   -- JSON query params
  user_email TEXT,
  created_at TEXT NOT NULL
);
