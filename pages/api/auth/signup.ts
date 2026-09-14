import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { originFrom } from "@/lib/appOrigin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
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
