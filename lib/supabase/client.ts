import { createBrowserClient } from '@supabase/ssr';

/** Browser Supabase client — implemented in Phase 1. */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase env vars. Copy .env.local.example to .env.local and add your keys.'
    );
  }

  return createBrowserClient(url, anonKey);
}
