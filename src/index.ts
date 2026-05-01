// ─────────────────────────────────────────────────────────────────────────────
// BlockLot CMS – Cloudflare Worker entry point
// ─────────────────────────────────────────────────────────────────────────────

import type { Env } from "./types.js";
import { router } from "./router.js";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      return await router(request, env, ctx);
    } catch (err: unknown) {
      console.error("Unhandled error:", err);
      const message = err instanceof Error ? err.message : "Internal Server Error";
      return new Response(JSON.stringify({ error: true, message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
} satisfies ExportedHandler<Env>;
