import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Anonymous Supabase client.
 * Phase 1 has no authenticated sessions — all reads/writes go through the
 * anon (publishable) key and are constrained by Row Level Security.
 */
export function getSupabase() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });
}
