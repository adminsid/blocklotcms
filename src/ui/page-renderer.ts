// ─────────────────────────────────────────────────────────────────────────────
// Page renderer  – assembles saved blocks into a full HTML page
// ─────────────────────────────────────────────────────────────────────────────

import type { Block, Env, TemplatePage, ThemeConfig } from "../types.js";
import { renderBlock } from "../blocks/index.js";

async function fetchBlocks(env: Env, ids: string[]): Promise<Block[]> {
  const blocks = await Promise.all(
    ids.map(async id => {
      const raw = await env.BLOCKS_KV.get(`block:${id}`);
      return raw ? (JSON.parse(raw) as Block) : null;
    })
  );
  return blocks.filter((b): b is Block => b !== null);
}

export async function renderPage(env: Env, slug: string): Promise<Response> {
  // Look up page by slug
  const row = await env.DB.prepare(
    "SELECT id, name, slug, block_ids, theme FROM pages WHERE slug = ?"
  ).bind(slug).first<{ id: string; name: string; slug: string; block_ids: string; theme: string }>();

  if (!row) {
    return new Response("Page not found", { status: 404, headers: { "Content-Type": "text/plain" } });
  }

  const page = {
    ...row,
    blockIds: JSON.parse(row.block_ids) as string[],
    theme: JSON.parse(row.theme) as ThemeConfig,
  } satisfies Pick<TemplatePage, "name" | "slug" | "blockIds" | "theme">;

  const blocks = await fetchBlocks(env, page.blockIds);
  const bodyHtml = blocks.map(b => renderBlock(b.type, b.config)).join("\n");

  const pageHtml = /* html */`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${page.name} | ${page.theme.companyName}</title>
<style>
*,*::before,*::after{box-sizing:border-box}
body{margin:0;font-family:${page.theme.fontFamily ?? "system-ui, sans-serif"};background:#fff;color:#111}
</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;

  return new Response(pageHtml, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
