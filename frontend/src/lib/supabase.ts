/**
 * Browser-side Supabase client — used ONLY for Google OAuth redirects.
 *
 * The rest of the app goes through FastAPI (adaptcode_session cookie), not
 * supabase-js, per CLAUDE.md. OAuth has to run in the browser because
 * Supabase's redirect flow is handled by the provider directly; after
 * Supabase sets its own cookies we POST the access token to a backend
 * endpoint which issues our own httpOnly adaptcode_session.
 *
 * Returns `null` when the env vars are missing (offline / preview mode).
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let _client: SupabaseClient | null = null;

export function getSupabaseBrowser(): SupabaseClient | null {
  if (!url || !key) return null;
  if (_client) return _client;
  _client = createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return _client;
}

export const SUPABASE_BROWSER_ENABLED = Boolean(url && key);
