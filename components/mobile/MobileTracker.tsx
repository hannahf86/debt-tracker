"use client";

import { useRouter } from "next/router";
import {
  CreditCard,
  Landmark,
  Zap,
  Receipt,
  Home,
  MoreHorizontal,
  ChevronRight,
} from "lucide-react";
import type { Debt } from "@/lib/types";
import {
  getDebtMonthStatus,
  hasPaymentInMonth,
  type TrackerData,
  type MonthStatus,
} from "@/lib/hooks/useTracker";
import MonthCell from "@/components/mobile/MonthCell";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const CATEGORY_ICON: Record<string, typeof CreditCard> = {
  "credit-card": CreditCard,
  loan: Landmark,
  utilities: Zap,
  tax: Receipt,
  household: Home,
  other: MoreHorizontal,
};

const LEGEND: { status: MonthStatus; word: string }[] = [
  { status: "paid", word: "Paid" },
  { status: "partial", word: "Part paid" },
  { status: "missed", word: "Nothing logged" },
  { status: "current", word: "This month" },
  { status: "future", word: "Not yet" },
];

export default function MobileTracker({
  data,
  isLoading,
}: {
  data: TrackerData;
  isLoading: boolean;
}) {
  const router = useRouter();
  const year = new Date().getFullYear();
  const thisMonth = new Date().getMonth();

  // Actual minimum created_at — months before it aren't missed payments.
  const earliestDebt =
    data.debts.length > 0
      ? new Date(
          Math.min(...data.debts.map((d) => new Date(d.created_at).getTime())),
        )
      : null;

  const percentOf = (d: Debt) =>
    d.total_amount > 0
      ? Math.round(((d.total_amount - d.amount_owed) / d.total_amount) * 100)
      : 0;

  if (isLoading) {
    return <p className="p-4 py-10 text-center text-sage-500">Loading tracker...</p>;
  }

  if (data.debts.length === 0) {
    return (
      <p className="p-4 py-10 text-center text-sage-500">
        No active debts to track.
      </p>
    );
  }

  return (
    <div className="p-4 pb-10 flex flex-col gap-3.5">
      <header>
        <h1 className="font-display text-[1.75rem] leading-tight font-extrabold text-sage-800">
          {year} tracker
        </h1>
        <p className="text-sm text-sage-500 mt-1">
          Every payment counts. Here&rsquo;s the full picture.
        </p>
      </header>

      {data.debts.map((debt) => {
        const Icon = CATEGORY_ICON[debt.category] ?? MoreHorizontal;
        const percent = percentOf(debt);

        return (
          <article
            key={debt.id}
            className="bg-white border border-mint-200 rounded-xl shadow-sm p-4"
          >
            {/* The header opens the debt; the month cells below keep their
                own behaviour, so no nested interactive elements. */}
            <button
              onClick={() => router.push(`/debts/${debt.id}`)}
              aria-label={`Open ${debt.company}`}
              className="w-full flex items-center gap-3 mb-3.5 text-left rounded-lg -m-1 p-1 active:bg-mint-100 transition-colors duration-fast"
            >
              <span
                className="flex items-center justify-center w-9 h-9 rounded-md bg-teal-50 text-brand shrink-0"
                aria-hidden="true"
              >
                <Icon size={18} />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block font-display text-[1.0625rem] font-bold text-sage-800 truncate">
                  {debt.company}
                </span>
                <span className="block text-xs text-sage-500">
                  {debt.monthly_amount ? `£${debt.monthly_amount}/mo · ` : ""}
                  £{Math.round(debt.amount_owed).toLocaleString()} left
                </span>
              </span>
              <span className="text-sm font-bold text-brand shrink-0">
                {percent}%
              </span>
              <ChevronRight size={18} className="text-sage-400 shrink-0" />
            </button>

            {/* The year transposed: this debt's twelve months, six across. */}
            <div className="grid grid-cols-6 gap-2">
              {MONTHS.map((month, idx) => {
                const monthStart = new Date(year, idx, 1);
                const beforeThisDebt = earliestDebt
                  ? monthStart <
                    new Date(
                      new Date(debt.created_at).getFullYear(),
                      new Date(debt.created_at).getMonth(),
                      1,
                    )
                  : true;

                // Backfilled payments predate the debt, so show them
                // instead of greying the month out.
                const backfilled = hasPaymentInMonth(
                  data.payments,
                  debt.id,
                  idx,
                  year,
                );

                // getDebtMonthStatus already returns "current" for this month
                // while nothing is paid. Hardcoding it here meant a payment
                // logged today never turned the cell green.
                const status: MonthStatus =
                  idx > thisMonth || (beforeThisDebt && !backfilled)
                    ? "future"
                    : getDebtMonthStatus(debt, data.payments, idx, year);

                return (
                  <div key={month} className="flex flex-col items-center gap-1">
                    <span className="text-2xs font-bold tracking-caps uppercase text-sage-400">
                      {month}
                    </span>
                    <MonthCell
                      status={status}
                      label={`${month}, ${debt.company}`}
                      size={38}
                      onClick={
                        idx <= thisMonth && (!beforeThisDebt || backfilled)
                          ? () => router.push(`/tracker/${idx + 1}`)
                          : undefined
                      }
                    />
                  </div>
                );
              })}
            </div>
          </article>
        );
      })}

      {/* Legend — colour is never the only signal, so name each state. */}
      <div className="flex flex-wrap gap-x-4 gap-y-2.5 pt-1">
        {LEGEND.map(({ status, word }) => (
          <div key={word} className="flex items-center gap-1.5">
            <MonthCell status={status} label={word} size={24} />
            <span className="text-xs text-sage-500">{word}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
