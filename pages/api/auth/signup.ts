import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { originFrom } from "@/lib/appOrigin";
import {
  clientIp,
  isDisposableEmail,
  looksAutomated,
  overLimit,
} from "@/lib/rateLimit";

/**
 * Creating an account.
 *
 * Every call here makes Supabase send an email, so an open endpoint means
 * anyone can post a stranger's address and have mail arrive from this domain.
 * That is what was happening on 2026-10-02: a script trying three sign-ins,
 * then a signup, then a password reset, over and over.
 *
 * The real wall is Supabase itself — with signups turned off in the dashboard
 * no account can be created at all, and that's where Mirian sits during
 * testing. These checks are what makes reopening safe:
 *
 *   - a honeypot field no person ever sees
 *   - a minimum time on the page, since a script submits instantly
 *   - a per-IP limit
 *   - no throwaway mailbox domains
 *
 * Deliberately no CAPTCHA: it falls hardest on exactly the people this app is
 * for. See lib/rateLimit.ts for what these checks can and can't do.
 */

const SIGNUPS_PER_IP = 3;
const WINDOW_MS = 60 * 60 * 1000;

/** What a bot sees, and what a person is told. Not the same thing. */
function quietlyRefuse(res: NextApiResponse, reason: string) {
  console.warn(`Signup refused: ${reason}`);
  return res.status(429).json({
    error:
      "We couldn't create an account just now. If you're a person and this keeps happening, do get in touch.",
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password, website, startedAt } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  if (looksAutomated(website, startedAt)) {
    return quietlyRefuse(res, "honeypot or submitted too fast");
  }

  if (overLimit(`signup:${clientIp(req)}`, SIGNUPS_PER_IP, WINDOW_MS)) {
    return quietlyRefuse(res, `too many from ${clientIp(req)}`);
  }

  if (typeof email === "string" && isDisposableEmail(email)) {
    return res.status(400).json({
      error:
        "That looks like a temporary email address. Please use one you'll still have access to — you'll need it to get back in.",
    });
  }

  // Checked here too: the page's own check is only a convenience.
  if (typeof password !== "string" || password.length < 8) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters" });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    // Without this the link follows Supabase's global Site URL, which is how a
    // production signup ends up pointing at localhost.
    options: { emailRedirectTo: `${originFrom(req)}/auth/callback` },
  });

  if (error) {
    /* Signups being closed in the dashboard is a setting, not a fault. Say so
       in plain words rather than passing Supabase's wording through. */
    if (/signups? not allowed|signup is disabled/i.test(error.message)) {
      return res.status(403).json({
        error:
          "Mirian is invite-only while it's being tested. If you'd like to be a tester, send us a message and we'll sort you out.",
        inviteOnly: true,
      });
    }
    return res.status(400).json({ error: error.message });
  }

  // No session back means Supabase is holding the account until the email link
  // is clicked. A session means "Confirm email" is switched off in the
  // dashboard, so the account is already usable — worth shouting about in logs.
  const confirmationRequired = !data.session;
  if (!confirmationRequired) {
    console.warn(
      "Signup returned a session: 'Confirm email' is OFF in Supabase, so new accounts skip verification.",
    );
  }

  // Only what the page needs — the full user object isn't the browser's business.
  return res.status(200).json({ confirmationRequired });
}
