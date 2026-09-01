import { useState, useEffect, useCallback } from "react";
import type { Debt, Payment } from "@/lib/types";

export type TrackerData = {
  debts: Debt[];
  payments: Payment[];
};

export type MonthStatus =
  | "paid"
  | "partial"
  | "missed"
  | "future"
  | "current"
  | "before-signup";

/** Does this debt have any payment recorded in the given month? */
export function hasPaymentInMonth(
  payments: Payment[],
  debtId: string,
  monthIndex: number,
  year: number,
): boolean {
  const monthStr = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
  return payments.some(
    (p) => p.debt_id === debtId && p.payment_date.startsWith(monthStr),
  );
}

export function getMonthStatus(
  debts: Debt[],
  payments: Payment[],
  monthIndex: number,
  year: number,
): MonthStatus {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  if (
    year > currentYear ||
    (year === currentYear && monthIndex > currentMonth)
  ) {
    return "future";
  }

  const monthStr = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
  const activeDebts = debts.filter((d) => d.arrangement !== null);

  if (activeDebts.length === 0) return "future";

  const hasAnyPayments = payments.some(
    (p) =>
      p.payment_date.startsWith(monthStr) &&
      activeDebts.some((d) => d.id === p.debt_id),
  );

  if (year === currentYear && monthIndex === currentMonth && !hasAnyPayments) {
    return "current";
  }

  let allPaid = true;
  let anyPartial = false;

  for (const debt of activeDebts) {
    const debtPayments = payments.filter(
      (p) => p.debt_id === debt.id && p.payment_date.startsWith(monthStr),
    );

    const totalPaid = debtPayments.reduce((sum, p) => sum + p.amount, 0);
    const expected = debt.monthly_amount || 0;

    if (totalPaid === 0) {
      allPaid = false;
    } else if (expected > 0 && totalPaid < expected) {
      anyPartial = true;
      allPaid = false;
    }
  }

  if (allPaid) return "paid";
  if (anyPartial) return "partial";
  return "missed";
}

export function getDebtMonthStatus(
  debt: Debt,
  payments: Payment[],
  monthIndex: number,
  year: number,
): MonthStatus {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  if (
    year > currentYear ||
    (year === currentYear && monthIndex > currentMonth)
  ) {
    return "future";
  }

  const monthStr = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
  const debtPayments = payments.filter(
    (p) => p.debt_id === debt.id && p.payment_date.startsWith(monthStr),
  );

  const totalPaid = debtPayments.reduce((sum, p) => sum + p.amount, 0);
  const expected = debt.monthly_amount || 0;

  if (year === currentYear && monthIndex === currentMonth && totalPaid === 0) {
    return "current";
  }

  if (totalPaid === 0) return "missed";
  if (expected > 0 && totalPaid < expected) return "partial";
  return "paid";
}

/** Is this month earlier than the month the debt was added? */
function isBeforeStart(startedAt: string, monthIndex: number, year: number) {
  const start = new Date(startedAt);
  return (
    new Date(year, monthIndex, 1) <
    new Date(start.getFullYear(), start.getMonth(), 1)
  );
}

function isFutureMonth(monthIndex: number, year: number) {
  const now = new Date();
  return (
    year > now.getFullYear() ||
    (year === now.getFullYear() && monthIndex > now.getMonth())
  );
}

/**
 * One debt's status for a month, with the "nothing was owed yet" guard.
 *
 * A payment backfilled into a month that predates the debt always wins — the
 * log-payment modal promises it will show in the tracker. Only an *empty*
 * month from before the debt existed reads as neutral, so a fresh account
 * isn't greeted by a row of missed payments it was never going to make.
 *
 * `neutral` is how that empty pre-debt month renders: the yearly grid has a
 * distinct "before-signup" treatment, everywhere else reuses "future".
 *
 * Use this rather than getDebtMonthStatus directly — that one has no notion
 * of when the debt started, and every screen that reimplemented the guard
 * around it got it subtly differently.
 */
export function debtMonthStatus(
  debt: Debt,
  payments: Payment[],
  monthIndex: number,
  year: number,
  neutral: MonthStatus = "future",
): MonthStatus {
  if (isFutureMonth(monthIndex, year)) return "future";

  if (hasPaymentInMonth(payments, debt.id, monthIndex, year)) {
    return getDebtMonthStatus(debt, payments, monthIndex, year);
  }

  if (isBeforeStart(debt.created_at, monthIndex, year)) return neutral;

  return getDebtMonthStatus(debt, payments, monthIndex, year);
}

/** The same rule across every debt, for the dashboard's year strip. */
export function allDebtsMonthStatus(
  debts: Debt[],
  payments: Payment[],
  monthIndex: number,
  year: number,
  neutral: MonthStatus = "future",
): MonthStatus {
  if (isFutureMonth(monthIndex, year)) return "future";
  if (debts.length === 0) return neutral;

  // Only judge the month on debts that actually existed in it, plus any with
  // a payment backfilled into it. Otherwise one debt paid in May makes the
  // whole month "missed" on account of debts that weren't added until
  // September — the strip would scold you for a month you did pay.
  const relevant = debts.filter(
    (d) =>
      hasPaymentInMonth(payments, d.id, monthIndex, year) ||
      !isBeforeStart(d.created_at, monthIndex, year),
  );
  if (relevant.length === 0) return neutral;

  return getMonthStatus(relevant, payments, monthIndex, year);
}

export function useTracker() {
  const [data, setData] = useState<TrackerData>({ debts: [], payments: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTracker = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/tracker");
      if (!response.ok) throw new Error("Failed to fetch tracker data");
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTracker();
  }, [fetchTracker]);

  return { data, isLoading, error, fetchTracker };
}
