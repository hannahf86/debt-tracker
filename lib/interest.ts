import type { Debt, Payment } from "@/lib/types";

/**
 * Interest: the rate on a debt, and where a payment actually went.
 *
 * Everything here is an estimate and is described as one wherever it reaches
 * the screen. Real creditors compound daily, charge on their own statement
 * date, and add fees Mirian knows nothing about, so these figures will be
 * close but never penny-identical to a statement. They exist to answer "how
 * much of my £50 actually came off?", which no statement answers plainly.
 *
 * A debt is 'frozen' until someone says otherwise. Most people on a payment
 * plan, a DMP, or a defaulted account have interest stopped, so that's the
 * quiet default — but the app says so on the debt rather than leaving it
 * unsaid, because a silent wrong assumption is worse than a visible one.
 */

/** Days in an average month, allowing for leap years. */
const DAYS_PER_MONTH = 30.4375;

/** A year and a day, so a long-forgotten debt can't accrue silly numbers. */
const MAX_DAYS = 366;

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Is this debt actually being charged interest we can work with? */
export function isCharging(debt: Pick<Debt, "interest_state" | "interest_rate">): boolean {
  return (
    debt.interest_state === "charged" &&
    typeof debt.interest_rate === "number" &&
    debt.interest_rate > 0
  );
}

/** Set to charged but with no rate typed in yet — the app can't do the sums. */
export function needsRate(debt: Pick<Debt, "interest_state" | "interest_rate">): boolean {
  return (
    debt.interest_state === "charged" &&
    (typeof debt.interest_rate !== "number" || debt.interest_rate <= 0)
  );
}

/**
 * Monthly rate from an APR, compounding rather than dividing by twelve.
 * 24.9% APR is 1.87% a month, not 2.08%.
 */
export function monthlyRate(apr: number): number {
  return Math.pow(1 + apr / 100, 1 / 12) - 1;
}

/** Interest on a balance over a number of days. */
export function interestOver(balance: number, apr: number, days: number): number {
  if (balance <= 0 || apr <= 0 || days <= 0) return 0;
  const capped = Math.min(days, MAX_DAYS);
  return round2(balance * monthlyRate(apr) * (capped / DAYS_PER_MONTH));
}

/** A month's worth, for the "is this payment big enough?" question. */
export function monthlyInterest(debt: Debt): number {
  if (!isCharging(debt)) return 0;
  return interestOver(debt.amount_owed, debt.interest_rate as number, DAYS_PER_MONTH);
}

function atMidnight(value: string | Date): Date {
  const d = new Date(value);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function daysBetween(from: string | Date, to: string | Date): number {
  const ms = atMidnight(to).getTime() - atMidnight(from).getTime();
  return Math.max(0, Math.round(ms / 86_400_000));
}

/**
 * Interest built up since the last payment — or since the debt was added, if
 * this is the first one.
 */
export function interestSince(
  debt: Debt,
  lastPaymentDate: string | null,
  upTo: string | Date = new Date(),
): number {
  if (!isCharging(debt)) return 0;
  const from = lastPaymentDate ?? debt.created_at;
  return interestOver(
    debt.amount_owed,
    debt.interest_rate as number,
    daysBetween(from, upTo),
  );
}

export type PaymentSplit = {
  /** What the interest ate. */
  interest: number;
  /** What actually came off the debt. */
  principal: number;
  balanceAfter: number;
  /** True when the interest was bigger than the payment. */
  balanceGrew: boolean;
};

/**
 * Where a payment went. Interest first, then whatever's left comes off the
 * balance — the order every lender uses.
 *
 * When the payment is smaller than the interest, principal is zero and the
 * balance goes up. That is a real thing that happens to real people and the
 * maths says so plainly; it's the screen's job to say it kindly.
 */
export function splitPayment(
  balance: number,
  amount: number,
  interest: number,
): PaymentSplit {
  const toInterest = round2(Math.min(interest, amount));
  const toPrincipal = round2(Math.max(0, amount - interest));
  const balanceAfter = round2(Math.max(0, balance + interest - amount));
  return {
    interest: toInterest,
    principal: toPrincipal,
    balanceAfter,
    balanceGrew: interest > amount,
  };
}

/** The most recent payment date for a debt, or null if there are none. */
export function lastPaymentDate(payments: Payment[], debtId: string): string | null {
  const dates = payments
    .filter((p) => p.debt_id === debtId)
    .map((p) => p.payment_date)
    .sort();
  return dates.length ? dates[dates.length - 1] : null;
}
