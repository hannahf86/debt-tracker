import { supabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * Who can add things, and who is reading a record they've already built.
 *
 * The shape of the deal, from docs/v2-paid-tier.md:
 *
 *   - 90 days free for everyone, counted from the day the account was made.
 *   - Then £5 a month, paid only when somebody chooses to. Nothing automatic,
 *     no card held.
 *   - Running out means READ-ONLY, never locked out. Signing in, reading the
 *     record, the PDF export and deleting the account all keep working, paid
 *     or not. The first two of those are law, not courtesy.
 *   - Testers never pay.
 *
 * Every check here runs on the server. The browser gets told the answer so it
 * can show the right thing, but the browser is the attacker's computer and its
 * opinion isn't the limit.
 */

export const TRIAL_DAYS = 90;

export type Entitlement = {
  /** Can they add payments and debts? */
  canWrite: boolean;
  state: "tester" | "trial" | "paid" | "ended";
  /** Days left in the trial, when in one. Negative once it's over. */
  trialDaysLeft: number | null;
  trialEnds: string | null;
  paidUntil: string | null;
};

const asDate = (value: string | null | undefined): Date | null =>
  value ? new Date(`${value}T00:00:00Z`) : null;

const toDateString = (d: Date) => d.toISOString().slice(0, 10);

function daysBetween(from: Date, to: Date): number {
  return Math.ceil((to.getTime() - from.getTime()) / 86_400_000);
}

/**
 * Work out where somebody stands, filling in their trial end date the first
 * time we look.
 *
 * The date is derived from when the account was created, not from when this
 * code first ran, so nobody gets a fresh 90 days just because the feature
 * arrived after they joined.
 */
export async function getEntitlement(userId: string): Promise<Entitlement> {
  const today = new Date(`${toDateString(new Date())}T00:00:00Z`);

  const { data: row } = await supabaseAdmin
    .from("users")
    .select("role, trial_ends, paid_until")
    .eq("id", userId)
    .maybeSingle();

  const role = row?.role ?? "user";
  let trialEnds = row?.trial_ends ?? null;

  if (role === "tester") {
    return {
      canWrite: true,
      state: "tester",
      trialDaysLeft: null,
      trialEnds: null,
      paidUntil: null,
    };
  }

  // First time we've looked at this account: date the trial from the day it
  // was created, and write it down so the answer never moves.
  if (!trialEnds) {
    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);
    const created = authUser?.user?.created_at
      ? new Date(authUser.user.created_at)
      : new Date();
    const ends = new Date(created);
    ends.setUTCDate(ends.getUTCDate() + TRIAL_DAYS);
    trialEnds = toDateString(ends);

    const { error } = await supabaseAdmin
      .from("users")
      .upsert({ id: userId, trial_ends: trialEnds }, { onConflict: "id" });
    if (error) console.error("Couldn't record trial end date:", error.message);
  }

  const endsOn = asDate(trialEnds);
  const paidUntil = asDate(row?.paid_until ?? null);

  const inTrial = endsOn !== null && today <= endsOn;
  const paid = paidUntil !== null && today <= paidUntil;

  return {
    canWrite: inTrial || paid,
    state: paid ? "paid" : inTrial ? "trial" : "ended",
    trialDaysLeft: endsOn ? daysBetween(today, endsOn) : null,
    trialEnds,
    paidUntil: row?.paid_until ?? null,
  };
}

/** What the API says when somebody's free period has run out. */
export const ENDED_MESSAGE =
  "Your free three months are up, so new payments can't be added just now. " +
  "Everything you've logged is still here, and you can read it, download it " +
  "or delete it whenever you like.";
