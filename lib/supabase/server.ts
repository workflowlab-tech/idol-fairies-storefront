import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client. SERVER-ONLY. Used exclusively by: (1) the standalone
 * knowledge-base ingestion script (run via tsx, outside Next.js), and (2)
 * RAG similarity search / product lookups inside /api/chat. Never import
 * this from a "use client" file — SUPABASE_SERVICE_ROLE_KEY is not
 * NEXT_PUBLIC_-prefixed, so Next.js already strips it from any client
 * bundle, which would surface as the "missing" error below rather than a
 * leaked key, but keep it server-only regardless. (Can't use the
 * `server-only` package here since this file is also required directly by
 * the plain-Node ingestion script, where that package unconditionally
 * throws.)
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Copy .env.example to .env.local and fill them in."
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
