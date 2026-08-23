import type { Debt } from "@/lib/types";

/**
 * Payoff projection.
 *
 * Assumes payments continue at each debt's current `monthly_amount` — i.e. the
 * "based on your current pay schedule" reading. It deliberately does NOT roll a
 * cleared debt's payment onto the next one (a snowball), because that would
 * promise a date the user hasn't actually committed to.
 */

/** Whole months until a debt clears at its current monthly amount. */
export function monthsRemaining(
  amountOwed: number,
  monthlyAmount: number | null,
): number | null {
  if (!monthlyAmount || monthlyAmount <= 0) return null;
  if (amountOwed <= 0) return 0;
  return Math.ceil(amountOwed / monthlyAmount);
}

/** The date a single debt clears, landing on its direct debit day. */
export function clearedDate(debt: Debt, from: Date = new Date()): Date | null {
  const months = monthsRemaining(debt.amount_owed, debt.monthly_amount);
  if (months === null) return null;

  const d = new Date(from.getFullYear(), from.getMonth() + months, 1);
  const lastDayOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  // No payment date set means we don't know which day it lands, so use the end
  // of the month — you're free *by* then rather than optimistically on the 1st.
  const day = debt.direct_debit_date ?? lastDayOfMonth;
  d.setDate(Math.min(day, lastDayOfMonth));
  return d;
}

/** "Jun 2027" (short) or "June 2027" (long). */
export function formatMonthYear(
  date: Date | null,
  month: "short" | "long" = "short",
): string {
  if (!date) return "—";
  return date.toLocaleDateString("en-GB", { month, year: "numeric" });
}

/** "15th May 2028" — the long form used for the headline debt-free day. */
export function formatLongDate(date: Date | null): string {
  if (!date) return "—";
  const day = date.getDate();
  const suffix =
    day % 100 >= 11 && day % 100 <= 13
      ? "th"
      : { 1: "st", 2: "nd", 3: "rd" }[day % 10] ?? "th";
  return `${day}${suffix} ${date.toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  })}`;
}

export type DebtFreeProjection = {
  /** When the last debt clears. Null if any debt can't be projected. */
  date: Date | null;
  /** Debts with no monthly amount set — these make the date unknowable. */
  unprojectable: Debt[];
  /** The debt that clears last, i.e. what's actually holding the date back. */
  longestPole: Debt | null;
  totalOwed: number;
  totalOriginal: number;
  totalCleared: number;
  /** Percent of the original total that's been paid off. */
  percentCleared: number;
};

/**
 * The whole picture. If any debt has no monthly amount we return a null date
 * rather than a confident-but-wrong one — the app's own rule is that unset
 * figures show as "—", never a guess.
 */
export function projectDebtFree(
  debts: Debt[],
  from: Date = new Date(),
): DebtFreeProjection {
  const totalOwed = debts.reduce((sum, d) => sum + d.amount_owed, 0);
  const totalOriginal = debts.reduce((sum, d) => sum + d.total_amount, 0);
  const totalCleared = Math.max(0, totalOriginal - totalOwed);
  const percentCleared =
    totalOriginal > 0 ? Math.round((totalCleared / totalOriginal) * 100) : 0;

  const outstanding = debts.filter((d) => d.amount_owed > 0);
  const unprojectable = outstanding.filter(
    (d) => !d.monthly_amount || d.monthly_amount <= 0,
  );

  let date: Date | null = null;
  let longestPole: Debt | null = null;

  if (outstanding.length > 0 && unprojectable.length === 0) {
    for (const debt of outstanding) {
      const d = clearedDate(debt, from);
      if (d && (!date || d > date)) {
        date = d;
        longestPole = debt;
      }
    }
  }

  return {
    date,
    unprojectable,
    longestPole,
    totalOwed,
    totalOriginal,
    totalCleared,
    percentCleared,
  };
}

export type BudgetUsage = {
  /** Sum of what the debts commit you to each month. */
  committed: number;
  budget: number | null;
  /** Committed as a share of budget, capped at 100 for the bar. */
  percent: number | null;
  over: boolean;
};

/**
 * How much of the monthly budget the current debts already commit.
 *
 * Going over isn't an error — plenty of people are committed to more than they
 * can comfortably pay, and that's exactly what the app exists to help with. It
 * is worth showing plainly though.
 */
export function budgetUsage(debts: Debt[], budget: number | null): BudgetUsage {
  const committed = debts.reduce((sum, d) => sum + (d.monthly_amount ?? 0), 0);
  if (!budget || budget <= 0) {
    return { committed, budget: null, percent: null, over: false };
  }
  return {
    committed,
    budget,
    percent: Math.min(100, Math.round((committed / budget) * 100)),
    over: committed > budget,
  };
}
