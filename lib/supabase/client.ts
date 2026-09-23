"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client. Uses the PUBLISHABLE (anon) key only — this is the
 * key Supabase designs to be shipped to the browser. Your data is protected
 * by the Row Level Security policies in supabase/migrations, not by hiding
 * this key. Never import a service_role key here.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
