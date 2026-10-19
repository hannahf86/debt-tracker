import type { ContactLog, Debt, Payment } from "@/lib/types";

/**
 * Things that have happened, marked.
 *
 * Every award counts something that can only go up: days since you started,
 * payments logged, months with something in them. Nothing resets, nothing is
 * lost, nothing can be failed. "100 days with Mirian" is a fact about being
 * here; a 100 day streak is a thing you can lose on day 101, and this app
 * doesn't have those.
 *
 * Unearned awards are shown, faded, with no progress bar, no count and no
 * "3 more days". A fact is information; a countdown is a demand with a
 * deadline attached. See docs/v2-rewards.md.
 */

export type RewardId =
  | "started"
  | "first-payment"
  | "days-30"
  | "days-60"
  | "days-100"
  | "days-200"
  | "year-1"
  | "days-500"
  | "year-2"
  | "wrote-to-them"
  | "asked-to-freeze"
  | "filled-the-year"
  | "arrangement"
  | "first-cleared"
  | "debt-free"
  | "back-again";

export type Reward = {
  id: RewardId;
  name: string;
  /** What it says when earned. Past tense, always. */
  description: string;
  group: "time" | "brave" | "milestone" | "returning";
  /** Whether it appears, faded, before it's earned. */
  previewable: boolean;
  /** Real postage rather than a printable. */
  physical?: boolean;
};

export const REWARDS: Reward[] = [
  {
    id: "started",
    name: "You started",
    description: "You added a debt. That is the hardest one.",
    group: "time",
    previewable: true,
  },
  {
    id: "first-payment",
    name: "One logged",
    description: "Your first payment, written down.",
    group: "time",
    previewable: true,
  },
  { id: "days-30", name: "A month in", description: "Thirty days with Mirian.", group: "time", previewable: true },
  { id: "days-60", name: "Two months", description: "Sixty days with Mirian.", group: "time", previewable: true },
  {
    id: "days-100",
    name: "100 days",
    description: "A hundred days of showing up.",
    group: "time",
    previewable: true,
    physical: true,
  },
  { id: "days-200", name: "200 days", description: "Two hundred days with Mirian.", group: "time", previewable: true },
  {
    id: "year-1",
    name: "A year of this",
    description: "Twelve months. That is a long time to keep looking.",
    group: "time",
    previewable: true,
    physical: true,
  },
  { id: "days-500", name: "500 days", description: "Five hundred days with Mirian.", group: "time", previewable: true },
  {
    id: "year-2",
    name: "Two years",
    description: "Two years of keeping your own record.",
    group: "time",
    previewable: true,
    physical: true,
  },
  {
    id: "wrote-to-them",
    name: "You wrote to them",
    description: "You sent a creditor a message. That is the frightening one.",
    group: "brave",
    previewable: true,
  },
  {
    id: "asked-to-freeze",
    name: "You asked them to freeze it",
    description: "You asked a creditor to stop the interest. Plenty say yes.",
    group: "brave",
    previewable: true,
  },
  {
    id: "filled-the-year",
    name: "You filled in your year",
    description: "You went back and logged payments from before you joined.",
    group: "brave",
    previewable: true,
  },
  {
    id: "arrangement",
    name: "Sorted an arrangement",
    description: "A debt moved from needing setting up to being in place.",
    group: "brave",
    previewable: true,
  },
  {
    id: "first-cleared",
    name: "One down",
    description: "A debt, gone. It no longer takes up space in your head.",
    group: "milestone",
    previewable: true,
  },
  {
    id: "debt-free",
    name: "Debt free",
    description: "All of it. Every one.",
    group: "milestone",
    previewable: true,
    physical: true,
  },
  {
    id: "back-again",
    name: "Back again",
    description:
      "You logged a payment after a month away. Coming back is harder than keeping going, and you did it.",
    group: "returning",
    /* Never previewed. Showing this one unearned would read as "lapse for a
       month to unlock", and it would spoil the only thing that makes it good:
       arriving unasked at the moment somebody feels worst about returning. */
    previewable: false,
  },
];

export type EarnedReward = { reward: Reward; on: string | null };

const day = 86_400_000;

function daysSince(iso: string | null): number {
  if (!iso) return 0;
  return Math.floor((Date.now() - new Date(iso).getTime()) / day);
}

/** Dates, oldest first, of payments that came after a month of nothing. */
function comebacks(payments: Payment[]): string[] {
  const dates = payments
    .map((p) => p.payment_date)
    .filter(Boolean)
    .sort();
  const found: string[] = [];
  for (let i = 1; i < dates.length; i += 1) {
    const gap =
      (new Date(dates[i]).getTime() - new Date(dates[i - 1]).getTime()) / day;
    if (gap >= 30) found.push(dates[i]);
  }
  return found;
}

/** The earliest sent_at in a list, whatever order it arrived in. */
function earliest(rows: ContactLog[]): string | null {
  const dates = rows.map((r) => r.sent_at).filter(Boolean).sort();
  return dates.length ? dates[0] : null;
}

export function earnedRewards({
  debts,
  payments,
  contacts,
  accountCreated,
}: {
  debts: Debt[];
  payments: Payment[];
  contacts: ContactLog[];
  accountCreated: string | null;
}): EarnedReward[] {
  const age = daysSince(accountCreated);
  const sorted = [...payments].sort((a, b) =>
    (a.payment_date ?? "").localeCompare(b.payment_date ?? ""),
  );
  const cleared = debts.filter((d) => d.amount_owed <= 0);
  const backs = comebacks(sorted);

  const on = (iso: string | null | undefined) => iso ?? null;

  const when: Partial<Record<RewardId, string | null>> = {
    started: debts.length > 0 ? on(debts[debts.length - 1]?.created_at) : undefined,
    "first-payment": sorted.length > 0 ? on(sorted[0].payment_date) : undefined,
    "days-30": age >= 30 ? null : undefined,
    "days-60": age >= 60 ? null : undefined,
    "days-100": age >= 100 ? null : undefined,
    "days-200": age >= 200 ? null : undefined,
    "year-1": age >= 365 ? null : undefined,
    "days-500": age >= 500 ? null : undefined,
    "year-2": age >= 730 ? null : undefined,
    /* The date of the FIRST one, not the latest: the award marks the day
       somebody first managed it. The API returns newest first. */
    "wrote-to-them": contacts.length > 0 ? on(earliest(contacts)) : undefined,
    "asked-to-freeze": contacts.some((c) => c.template === "freeze_interest")
      ? on(earliest(contacts.filter((c) => c.template === "freeze_interest")))
      : undefined,
    /* Backfilling: a payment dated before the debt it belongs to existed. */
    "filled-the-year": sorted.some((p) => {
      const debt = debts.find((d) => d.id === p.debt_id);
      return debt ? new Date(p.payment_date) < new Date(debt.created_at) : false;
    })
      ? null
      : undefined,
    arrangement: debts.some((d) => d.arrangement === "payment-plan") ? null : undefined,
    "first-cleared": cleared.length > 0 ? null : undefined,
    "debt-free":
      debts.length > 0 && cleared.length === debts.length ? null : undefined,
    "back-again": backs.length > 0 ? backs[backs.length - 1] : undefined,
  };

  return REWARDS.filter((r) => when[r.id] !== undefined).map((r) => ({
    reward: r,
    on: when[r.id] ?? null,
  }));
}

/** The ones not earned yet that are fit to show. No countdowns anywhere. */
export function previewRewards(earned: EarnedReward[]): Reward[] {
  const has = new Set(earned.map((e) => e.reward.id));
  return REWARDS.filter((r) => r.previewable && !has.has(r.id));
}
