/**
 * DEV-ONLY AUTH BYPASS — for local screenshots/design work.
 *
 * Enabled only when BOTH are true:
 *   1. NODE_ENV !== "production"   (so a stray flag can never disable auth on Vercel)
 *   2. NEXT_PUBLIC_DEV_NO_AUTH === "true"   (set in .env.local, which is gitignored)
 *
 * To turn it off: remove NEXT_PUBLIC_DEV_NO_AUTH from .env.local and restart.
 * To remove it entirely: delete this file and swap `getSession` back to
 * `getServerSession(req, res, authOptions)` in pages/api/**.
 */
import { getServerSession } from "next-auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { authOptions } from "@/lib/authOptions";
import type { NextApiRequest, NextApiResponse } from "next";
import type { Session } from "next-auth";
import { DEV_NO_AUTH, DEV_EMAIL } from "@/lib/devFlags";

export { DEV_NO_AUTH, DEV_EMAIL } from "@/lib/devFlags";

let cachedDevUserId: string | null = null;

/** Picks the account to browse as: DEV_USER_ID if set, else the first user in the DB. */
async function resolveDevUserId(): Promise<string | null> {
  if (cachedDevUserId) return cachedDevUserId;

  if (process.env.DEV_USER_ID) {
    cachedDevUserId = process.env.DEV_USER_ID;
    return cachedDevUserId;
  }

  const { data } = await supabaseAdmin
    .from("users")
    .select("id")
    .limit(1)
    .maybeSingle();
  cachedDevUserId = data?.id ?? null;
  return cachedDevUserId;
}

/** The synthetic session used while DEV_NO_AUTH is on. */
export async function getDevSession(): Promise<Session | null> {
  const id = await resolveDevUserId();
  if (!id) return null;
  return {
    user: { id, email: DEV_EMAIL, name: "Demo" },
    expires: new Date(Date.now() + 86_400_000).toISOString(),
  } as Session;
}

/** Drop-in replacement for getServerSession(req, res, authOptions). */
export async function getSession(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<Session | null> {
  if (!DEV_NO_AUTH) {
    return getServerSession(req, res, authOptions);
  }

  return getDevSession();
}
