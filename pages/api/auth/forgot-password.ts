import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

/**
 * Sends a password reset email.
 *
 * Always answers 200, even for an address with no account. Telling a caller
 * whether an email is registered leaks who banks with what — and the honest
 * "check your inbox" message is the kinder one either way.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body;

  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Email required" });
  }

  // Where Supabase sends them after they click the link. Must also be listed
  // in Supabase → Authentication → URL Configuration → Redirect URLs.
  const proto =
    (req.headers["x-forwarded-proto"] as string)?.split(",")[0] ?? "http";
  const host = req.headers.host;
  const origin = process.env.NEXTAUTH_URL?.trim() || `${proto}://${host}`;
  const redirectTo = `${origin.replace(/\/$/, "")}/auth/reset-password`;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    // Log it for us, but don't hand the caller anything they could probe with.
    console.error("Password reset request failed:", error.message);
  }

  return res.status(200).json({ ok: true });
}
