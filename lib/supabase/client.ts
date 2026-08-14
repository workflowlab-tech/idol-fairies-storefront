import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const MISSING_ENV_MESSAGE =
  "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Copy .env.example to .env.local and fill them in.";

/**
 * Public/publishable client — safe to use in server components and client
 * components alike. Read-only storefront access only. Never import the
 * service-role client from anything that ships to the browser.
 *
 * When the env vars are absent we defer the error to first use (via a proxy)
 * instead of throwing at module evaluation. That keeps behavior identical when
 * Supabase is configured, while letting callers that already guard failures
 * (e.g. `getAllProducts().catch(() => [])`) degrade gracefully so the app can
 * still render.
 */
export const supabase =
  url && key
    ? createClient(url, key, { auth: { persistSession: false } })
    : (new Proxy(
        {},
        {
          get() {
            throw new Error(MISSING_ENV_MESSAGE);
          },
        }
      ) as ReturnType<typeof createClient>);
