import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client. SERVER ONLY — never import this from a
 * component or anything that ends up in the browser bundle.
 *
 * Needed for `auth.admin.*` calls: the app authenticates through NextAuth
 * rather than a Supabase session, so there is no user JWT to act on behalf of.
 * The anon key silently fails those calls.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);
