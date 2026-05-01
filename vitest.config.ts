import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
  test: {
    poolOptions: {
      workers: {
        wrangler: { configPath: "./wrangler.toml" },
        miniflare: {
          kvNamespaces: ["BLOCKS_KV"],
          d1Databases: ["DB"],
          r2Buckets: ["MEDIA_BUCKET"],
          bindings: {
            RESO_API_BASE_URL: "https://mock.reso.test/odata",
            RESO_API_KEY: "test-api-key",
            ALLOWED_ORIGINS: "*",
          },
        },
      },
    },
  },
});
