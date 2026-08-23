import type { NextApiRequest } from "next";

/**
 * The origin this request actually arrived on.
 *
 * Supabase emails otherwise follow the project's single global Site URL, which
 * means a signup from production can land you on localhost. Passing an explicit
 * redirect per request keeps each environment sending links back to itself.
 *
 * Note the target still has to be listed under Supabase → Authentication →
 * URL Configuration → Redirect URLs, or Supabase rejects it.
 */
export function originFrom(req: NextApiRequest): string {
  const configured = process.env.NEXTAUTH_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");

  const proto =
    (req.headers["x-forwarded-proto"] as string | undefined)?.split(",")[0] ??
    "http";
  const host =
    (req.headers["x-forwarded-host"] as string | undefined) ?? req.headers.host;

  return `${proto}://${host}`.replace(/\/$/, "");
}
