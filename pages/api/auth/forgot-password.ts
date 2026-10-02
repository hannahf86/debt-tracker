import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { originFrom } from "@/lib/appOrigin";
import { clientIp, looksAutomated, overLimit } from "@/lib/rateLimit";

/**
 * Sends a password reset email.
 *
 * Always answers 200, even for an address with no account. Telling a caller
 * whether an email is registered leaks who banks with what — and the honest
 * "check your inbox" message is the kinder one either way.
 *
 * It also sends an email every time it's called, which is why it's limited per
 * IP and per address. A reset link arriving unbidden is alarming on its own;
 * twenty of them is harassment, and it comes from this domain.
 *
 * The answer stays 200 even when the limit is hit, for the same reason: a
 * different response would say "this one is registered".
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, website, startedAt } = req.body;

  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Email required" });
  }

  const ip = clientIp(req);
  const address = email.toLowerCase().trim();

  /* Three refusals that all look identical from outside: an automated
     submission, too many from one address, too many to one mailbox. */
  if (
    looksAutomated(website, startedAt) ||
    overLimit(`reset-ip:${ip}`, 5, 60 * 60 * 1000) ||
    overLimit(`reset-to:${address}`, 3, 60 * 60 * 1000)
  ) {
    console.warn(`Password reset throttled for ${ip}`);
    return res.status(200).json({ ok: true });
  }

  // Where Supabase sends them after they click the link. Must also be listed
  // in Supabase → Authentication → URL Configuration → Redirect URLs.
  const redirectTo = `${originFrom(req)}/auth/reset-password`;

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
