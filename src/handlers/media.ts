// ─────────────────────────────────────────────────────────────────────────────
// /api/media  – R2-backed media upload & retrieval
// ─────────────────────────────────────────────────────────────────────────────

import type { Env } from "../types.js";
import { errorResponse, generateId, json } from "../utils.js";

const ALLOWED_MIME = new Set([
  "image/jpeg", "image/png", "image/webp", "image/gif",
  "application/pdf",
]);

// ── POST /api/media (multipart/form-data) ────────────────────────────────────
export async function uploadMedia(req: Request, env: Env): Promise<Response> {
  const contentType = req.headers.get("Content-Type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return errorResponse("Expected multipart/form-data");
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return errorResponse("Failed to parse form data");
  }

  const file = formData.get("file");
  // In Workers runtime File is a subtype of Blob; check for the name property.
  if (!file || typeof file === "string" || !("name" in file)) {
    return errorResponse("'file' field is required");
  }
  const fileBlob = file as File;

  if (!ALLOWED_MIME.has(fileBlob.type)) {
    return errorResponse(`File type '${fileBlob.type}' is not allowed. Allowed: ${[...ALLOWED_MIME].join(", ")}`);
  }

  const MAX_BYTES = 20 * 1024 * 1024; // 20 MB
  if (fileBlob.size > MAX_BYTES) {
    return errorResponse("File exceeds 20 MB limit");
  }

  const ext = fileBlob.name.split(".").pop() ?? "bin";
  const key = `media/${generateId()}.${ext}`;

  await env.MEDIA_BUCKET.put(key, fileBlob.stream(), {
    httpMetadata: { contentType: fileBlob.type },
    customMetadata: { originalName: fileBlob.name },
  });

  return json({ key, url: `/api/media/${key}`, contentType: fileBlob.type, size: fileBlob.size }, 201);
}

// ── GET /api/media/:key ──────────────────────────────────────────────────────
export async function getMedia(
  _req: Request,
  env: Env,
  key: string
): Promise<Response> {
  const object = await env.MEDIA_BUCKET.get(key);
  if (!object) return errorResponse("Media not found", 404);

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("ETag", object.etag);

  return new Response(object.body, { headers });
}

// ── DELETE /api/media/:key ───────────────────────────────────────────────────
export async function deleteMedia(
  _req: Request,
  env: Env,
  key: string
): Promise<Response> {
  const existing = await env.MEDIA_BUCKET.head(key);
  if (!existing) return errorResponse("Media not found", 404);
  await env.MEDIA_BUCKET.delete(key);
  return json({ deleted: true, key });
}
