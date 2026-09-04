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

/**
 * The first of the month the user's history starts in — the month their
 * earliest debt was added. Null when they have no debts yet.
 */
export function startOfMonth(value: string | Date): Date {
  const d = value instanceof Date ? value : new Date(value);
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function trackerStartMonth(debts: Debt[]): Date | null {
  if (debts.length === 0) return null;
  return startOfMonth(
    new Date(Math.min(...debts.map((d) => new Date(d.created_at).getTime()))),
  );
}

const monthKey = (monthIndex: number, year: number) =>
  `${year}-${String(monthIndex + 1).padStart(2, "0")}`;

const paidTowards = (
  debtId: string,
  payments: Payment[],
  monthIndex: number,
  year: number,
) =>
  payments
    .filter(
      (p) =>
        p.debt_id === debtId &&
        p.payment_date.startsWith(monthKey(monthIndex, year)),
    )
    .reduce((sum, p) => sum + p.amount, 0);

/**
 * Status for a month that predates the earliest debt.
 *
 * The API lets a payment be back-dated to before its debt was added (it
 * records it without moving the balance), so these months can hold real
 * payments and must show them. But a debt with nothing logged here is *not* a
 * miss — nothing was owed yet — so only debts that were actually paid count.
 *
 * Null means the month is genuinely empty, and the caller should leave it
 * blank rather than mark it missed.
 */
export function getBackfilledMonthStatus(
  debts: Debt[],
  payments: Payment[],
  monthIndex: number,
  year: number,
): MonthStatus | null {
  const activeDebts = debts.filter((d) => d.arrangement !== null);

  let sawPayment = false;
  let anyPartial = false;

  for (const debt of activeDebts) {
    const totalPaid = paidTowards(debt.id, payments, monthIndex, year);
    if (totalPaid === 0) continue;

    sawPayment = true;
    const expected = debt.monthly_amount || 0;
    if (expected > 0 && totalPaid < expected) anyPartial = true;
  }

  if (!sawPayment) return null;
  return anyPartial ? "partial" : "paid";
}

/**
 * One cell of the year strip, across every debt.
 *
 * Single source of truth for the dashboard strips and the yearly table, which
 * each used to blank out every month before the first debt was added —
 * hiding back-dated payments entirely.
 */
export function getStripMonthStatus(
  debts: Debt[],
  payments: Payment[],
  monthIndex: number,
  year: number,
): MonthStatus {
  const now = new Date();

  if (
    year > now.getFullYear() ||
    (year === now.getFullYear() && monthIndex > now.getMonth())
  ) {
    return "future";
  }

  const start = trackerStartMonth(debts);
  if (!start) return "future";

  if (new Date(year, monthIndex, 1) < start) {
    return (
      getBackfilledMonthStatus(debts, payments, monthIndex, year) ??
      "before-signup"
    );
  }

  return getMonthStatus(debts, payments, monthIndex, year);
}

/** As getStripMonthStatus, for a single debt's row in the yearly table. */
export function getDebtStripMonthStatus(
  debt: Debt,
  payments: Payment[],
  monthIndex: number,
  year: number,
  startMonth: Date | null,
): MonthStatus {
  const now = new Date();

  if (
    year > now.getFullYear() ||
    (year === now.getFullYear() && monthIndex > now.getMonth())
  ) {
    return "future";
  }

  if (startMonth && new Date(year, monthIndex, 1) < startMonth) {
    const totalPaid = paidTowards(debt.id, payments, monthIndex, year);
    if (totalPaid === 0) return "before-signup";
    const expected = debt.monthly_amount || 0;
    return expected > 0 && totalPaid < expected ? "partial" : "paid";
  }

  return getDebtMonthStatus(debt, payments, monthIndex, year);
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
