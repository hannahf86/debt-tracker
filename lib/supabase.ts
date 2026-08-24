import { createClient } from "@supabase/supabase-js";

/**
 * Anon-key client. AUTH FLOWS ONLY — sign-in, sign-up, password reset.
 *
 * Do not use this to read or write tables. This key ships in the browser
 * bundle, so whatever it can reach, the public can reach. Table access goes
 * through lib/supabaseAdmin.ts from the API routes, which is what allows
 * row-level security to stay closed to anon.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
