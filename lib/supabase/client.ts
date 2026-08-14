import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Copy .env.example to .env.local and fill them in."
  );
}

/**
 * Public/publishable client — safe to use in server components and client
 * components alike. Read-only storefront access only. Never import the
 * service-role client from anything that ships to the browser.
 */
export const supabase = createClient(url, key, {
  auth: { persistSession: false },
});
