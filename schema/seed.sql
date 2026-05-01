-- BlockLot CMS – seed data for local development
-- Apply with: wrangler d1 execute blocklotcms-db --file=schema/seed.sql

INSERT OR IGNORE INTO pages (id, name, slug, block_ids, theme, created_at, updated_at)
VALUES (
  'seed-home-page',
  'Home Page',
  'home',
  '[]',
  '{"primaryColor":"#1a56db","accentColor":"#f59e0b","fontFamily":"system-ui, sans-serif","companyName":"Demo Realty","phone":"(555) 000-0000","email":"info@demorealty.com"}',
  datetime('now'),
  datetime('now')
);
