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

  // Current month in progress
  if (year === currentYear && monthIndex === currentMonth) {
    return "current";
  }

  // Future month
  if (
    year > currentYear ||
    (year === currentYear && monthIndex > currentMonth)
  ) {
    return "future";
  }

  const monthStr = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;

  const activeDebts = debts.filter((d) => d.arrangement !== null);

  if (activeDebts.length === 0) return "future";

  let allPaid = true;
  let anyPaid = false;
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
      anyPaid = true;
      allPaid = false;
    } else {
      anyPaid = true;
    }
  }

  if (allPaid) return "paid";
  if (anyPartial && !allPaid) return "partial";
  if (anyPaid && !allPaid) return "missed";
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

  if (year === currentYear && monthIndex === currentMonth) {
    return "current";
  }

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

  if (totalPaid === 0) return "missed";
  if (expected > 0 && totalPaid < expected) return "partial";
  return "paid";
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
