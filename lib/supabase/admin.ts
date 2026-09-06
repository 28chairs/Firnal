import { createClient } from '@supabase/supabase-js';

/** Service-role Supabase client for server-side storage uploads. */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('Supabase admin credentials are not configured');
  }

  return createClient(url, serviceRoleKey);
}
