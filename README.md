# 🏠 BlockLot CMS

A **Cloudflare Worker-based real estate website builder** with RESO Web API integration, reusable page blocks, and a drag-and-drop page builder. Built for developers who work with real estate companies and need to ship compliant, high-performance property websites fast.

---

## ✨ Features

| Feature | Description |
|---|---|
| **Block System** | 10 ready-made real estate blocks you can reuse across any site |
| **RESO Web API** | Proxy/search listings via any RESO-compliant MLS OData endpoint |
| **Visual Builder** | Drag-and-drop page builder served directly from the Worker at `/builder` |
| **D1 Templates** | Save assembled pages to Cloudflare D1 and serve them at `/pages/:slug` |
| **KV Block Store** | Block instances stored in Cloudflare KV for sub-millisecond reads |
| **R2 Media** | Upload, serve, and delete listing photos & flyers via R2 |
| **Lead Capture** | Contact form submissions stored in D1 with optional email |
| **CORS** | Configurable `ALLOWED_ORIGINS` for multi-tenant / headless setups |
| **TypeScript** | Fully typed with strict mode; zero runtime dependencies |
| **Tests** | 48 tests covering all blocks and all API endpoints |

---

## 📦 Available Blocks

| Block Type | Description |
|---|---|
| `mortgage-calculator` | Interactive PITI monthly payment estimator |
| `listing-card` | RESO-standard property summary card with photo, status badge, and stats |
| `listing-gallery` | Responsive lightbox gallery for MLS listing Media |
| `listing-flyer` | Print-ready marketing flyer with photos, stats, and agent branding |
| `property-search` | Quick-search hero bar that POSTs to a configurable results URL |
| `contact-form` | Lead-capture form with Equal Housing Opportunity disclaimer |
| `agent-profile` | Agent bio card with credentials, specialties, languages, and social links |
| `hero-banner` | Full-width headline section with background image support |
| `open-house-countdown` | Live countdown timer to the next open house event |
| `neighborhood-stats` | Market statistics widget (median price, DOM, price/sqft, etc.) |

---

## 🚀 Getting Started

### 1 — Prerequisites

```bash
npm install -g wrangler   # Cloudflare's CLI
```

### 2 — Clone & install

```bash
git clone https://github.com/adminsid/blocklotcms.git
cd blocklotcms
npm install
```

### 3 — Create Cloudflare resources

```bash
# KV namespace for block definitions
wrangler kv namespace create BLOCKS_KV
# → Copy the id and preview_id into wrangler.toml

# D1 database for pages, leads, saved searches
wrangler d1 create blocklotcms-db
# → Copy the database_id into wrangler.toml

# R2 bucket for media (photos, flyers)
wrangler r2 bucket create blocklotcms-media
```

### 4 — Configure bindings

Edit `wrangler.toml` and replace every `REPLACE_WITH_YOUR_*` placeholder:

```toml
[[kv_namespaces]]
binding    = "BLOCKS_KV"
id         = "abc123..."          # from step 3
preview_id = "def456..."

[[d1_databases]]
binding       = "DB"
database_name = "blocklotcms-db"
database_id   = "ghi789..."       # from step 3

[[r2_buckets]]
binding     = "MEDIA_BUCKET"
bucket_name = "blocklotcms-media"
```

### 5 — Set secrets

```bash
# Required: your RESO / MLS API bearer token
wrangler secret put RESO_API_KEY

# Optional: if your MLS uses OAuth2 instead of a static key
wrangler secret put RESO_CLIENT_ID
wrangler secret put RESO_CLIENT_SECRET

# Optional: protects GET /api/contact (leads list)
wrangler secret put SESSION_SECRET
```

Create `.dev.vars` (never commit) for local development:

```bash
cp .dev.vars.example .dev.vars
# Fill in RESO_API_KEY, etc.
```

### 6 — Run database migrations

```bash
# Local dev
wrangler d1 migrations apply blocklotcms-db --local

# Production
wrangler d1 migrations apply blocklotcms-db
```

### 7 — Run locally

```bash
npm run dev
# → http://localhost:8787
```

Open **http://localhost:8787/builder** to use the visual page builder.

### 8 — Deploy

```bash
npm run deploy
```

---

## 🔌 API Reference

All endpoints support JSON and return proper `Content-Type` headers.  
CORS is configured via the `ALLOWED_ORIGINS` environment variable.

### Blocks

```
GET    /api/blocks/definitions      List all available block types + schemas
GET    /api/blocks                  List saved block instances
POST   /api/blocks                  Create a block instance
GET    /api/blocks/:id              Get a block instance
PUT    /api/blocks/:id              Update a block instance
DELETE /api/blocks/:id              Delete a block instance
GET    /api/blocks/:id/render       Render block as HTML (embeddable snippet)
```

**Create a block:**

```bash
curl -X POST https://your-worker.workers.dev/api/blocks \
  -H "Content-Type: application/json" \
  -d '{
    "type": "mortgage-calculator",
    "label": "My Calculator",
    "config": {
      "defaultPrice": 550000,
      "defaultRate": 6.75,
      "primaryColor": "#2563eb"
    }
  }'
```

### Templates / Pages

```
GET    /api/templates               List all pages
POST   /api/templates               Create a page
GET    /api/templates/:id           Get a page
PUT    /api/templates/:id           Update a page
DELETE /api/templates/:id           Delete a page
GET    /pages/:slug                 Render a saved page as full HTML
```

### Listings (RESO Web API Proxy)

```
GET    /api/listings                Search listings (see query params below)
GET    /api/listings/:key           Get a single listing by ListingKey
```

**Listing search params:**

| Param | Description | Example |
|---|---|---|
| `q` | Free-text search (city/ZIP/street) | `q=Denver` |
| `status` | RESO StandardStatus | `status=Active` |
| `type` | PropertyType | `type=Residential` |
| `minPrice` | Minimum ListPrice | `minPrice=300000` |
| `maxPrice` | Maximum ListPrice | `maxPrice=600000` |
| `minBeds` | Minimum BedroomsTotal | `minBeds=3` |
| `minBaths` | Minimum BathroomsTotalInteger | `minBaths=2` |
| `$top` | Max results (default 20) | `$top=50` |
| `$orderby` | OData orderby | `$orderby=ListPrice asc` |
| `$filter` | Raw OData $filter | `$filter=City eq 'Boulder'` |

### Media (R2)

```
POST   /api/media                   Upload a file (multipart/form-data, field: "file")
GET    /api/media/:key              Download/serve a file
DELETE /api/media/:key              Delete a file
```

**Allowed types:** `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `application/pdf`  
**Max size:** 20 MB

### Lead Capture

```
POST   /api/contact                 Submit a contact / showing request
GET    /api/contact                 List leads (requires Bearer SESSION_SECRET)
```

---

## 🏗 Project Structure

```
blocklotcms/
├── src/
│   ├── index.ts                 # Worker entry point
│   ├── router.ts                # Request routing
│   ├── types.ts                 # Global TypeScript types (Env, Block, ResoListing …)
│   ├── utils.ts                 # HTTP helpers, route matching, ID generation
│   ├── blocks/
│   │   ├── index.ts             # Block registry & renderBlock()
│   │   ├── mortgage-calculator.ts
│   │   ├── listing-card.ts
│   │   ├── listing-gallery.ts
│   │   ├── listing-flyer.ts
│   │   ├── property-search.ts
│   │   ├── contact-form.ts
│   │   ├── agent-profile.ts
│   │   ├── hero-banner.ts
│   │   ├── open-house-countdown.ts
│   │   └── neighborhood-stats.ts
│   ├── handlers/
│   │   ├── blocks.ts            # /api/blocks CRUD
│   │   ├── templates.ts         # /api/templates CRUD
│   │   ├── listings.ts          # /api/listings RESO proxy
│   │   ├── media.ts             # /api/media R2 upload/serve
│   │   └── contact.ts           # /api/contact lead capture
│   └── ui/
│       ├── builder.ts           # Visual builder HTML (served at /builder)
│       └── page-renderer.ts     # Assemble saved pages at /pages/:slug
├── schema/
│   ├── 001_initial.sql          # D1 schema (pages, leads, saved_searches)
│   └── seed.sql                 # Sample data for local dev
├── test/
│   ├── utils.test.ts            # Unit tests: route matching, ID generation
│   ├── blocks.test.ts           # Unit tests: all 10 block renderers
│   └── worker.test.ts           # Integration tests: full HTTP API
├── wrangler.toml                # Cloudflare Worker + bindings config
├── vitest.config.ts             # Test runner config
├── tsconfig.json
└── package.json
```

---

## 🧪 Running Tests

```bash
npm test            # Run all tests once
npm run test:watch  # Watch mode
npm run build       # TypeScript type-check only
npm run lint        # ESLint
```

---

## 📐 Architecture & Bindings

```
┌──────────────────────────────────────────────────────┐
│                  Cloudflare Worker                   │
│                                                      │
│  Request → Router → Handler → Response               │
│                                                      │
│  Bindings:                                           │
│  ┌─────────┐  ┌────┐  ┌──────────────┐              │
│  │BLOCKS_KV│  │ DB │  │MEDIA_BUCKET  │              │
│  │ (KV)    │  │(D1)│  │  (R2)        │              │
│  └─────────┘  └────┘  └──────────────┘              │
│                                                      │
│  Secrets: RESO_API_KEY, SESSION_SECRET               │
└──────────────────────────────────────────────────────┘
         │                           │
         ▼                           ▼
  RESO Web API               End-user browsers
  (MLS OData)              (listings, pages, builder)
```

| Binding | Purpose |
|---|---|
| `BLOCKS_KV` | Stores serialised block instances for O(1) reads |
| `DB` (D1) | Relational store for pages, leads, saved searches |
| `MEDIA_BUCKET` (R2) | Binary assets: listing photos, flyer PDFs, logos |
| `RESO_API_KEY` | Bearer token for your RESO Web API / MLS data provider |

---

## 🏛 Real Estate Compliance Notes

1. **Equal Housing Opportunity (EHO)** — The `contact-form` and `listing-flyer` blocks render the EHO disclaimer by default. Keep `equalHousingDisclaimer: true` in production.
2. **MLS Data Agreements** — Listing data cached by this worker defaults to 5-minute TTL (`CACHE_TTL = 300` in `src/handlers/listings.ts`). Check your MLS data agreement for the maximum allowed cache duration.
3. **RESO Certification** — This project proxies the RESO Web API (OData) as-is. Consult your MLS board about any field mapping or display rules.
4. **Lead Data** — Contact form submissions are stored in D1. Ensure your privacy policy covers how you handle and retain this data.
5. **State Licensing** — Real estate advertising rules vary by state. Always display appropriate disclaimers and your agent's state license number.

---

## 🤝 Contributing

1. Fork and clone the repository
2. Create a feature branch (`git checkout -b feat/my-block`)
3. Add your block to `src/blocks/`, register it in `src/blocks/index.ts`, and write tests
4. Ensure `npm test` and `npm run build` pass
5. Open a pull request

---

## 📄 License

MIT © BlockLot Contributors