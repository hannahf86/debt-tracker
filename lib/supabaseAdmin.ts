import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client. SERVER ONLY — never import this from a
 * component or anything that ends up in the browser bundle.
 *
 * Needed for `auth.admin.*` calls: the app authenticates through NextAuth
 * rather than a Supabase session, so there is no user JWT to act on behalf of.
 * The anon key silently fails those calls.
 *
 * For the same reason it is now the client every API route reads and writes
 * data through — see the `db` alias below.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

/**
 * The data client for API routes. Same service-role connection as above.
 *
 * Because the app signs users in through NextAuth, no Supabase user JWT ever
 * reaches Postgres, so `auth.uid()` is null and per-user RLS policies can
 * never match. Requests used to go out on the anon key instead, which meant
 * the tables had to be readable by `anon` for the app to work at all — and the
 * anon key is public (it is inlined into the browser bundle). Anyone could
 * read every user's data straight off the REST API.
 *
 * Routing data through the service role lets `anon` be revoked entirely, so
 * the only way to this data is through a handler that has checked the session.
 * That makes every route responsible for scoping its own queries to
 * `session.user.id` — there is no second line of defence behind it.
 *
 * See db/rls.sql for the matching database side, which is what actually
 * closes the hole.
 */
export const db = supabaseAdmin;
