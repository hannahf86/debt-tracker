import { createClient } from "@supabase/supabase-js";

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "SUPABASE_SERVICE_ROLE_KEY is not set. The API routes need it to reach " +
      "the database — see .env.example.",
  );
}

/**
 * Service-role Supabase client. SERVER ONLY — never import this from a
 * component or anything else that ends up in the browser bundle.
 *
 * Used for two things:
 *
 * 1. All table access from the API routes. The app authenticates through
 *    NextAuth, so there is no Supabase user JWT for a row-level-security
 *    policy to match on. Reading through the anon key instead would mean
 *    leaving RLS open to anon — and that key is public. Going through the
 *    service role lets RLS stay closed to everyone while the routes still
 *    work. Isolation is then enforced by the `user_id` filters in
 *    pages/api, so every query MUST carry one.
 *
 * 2. `auth.admin.*` calls (password change, account delete, reading profile
 *    metadata), which the anon key silently fails.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);
