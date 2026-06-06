"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { useTracker, getDebtMonthStatus } from "@/lib/hooks/useTracker";
import { Check, X, Minus, MapPin } from "lucide-react";

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function YearlyTrackerPage() {
  const router = useRouter();
  const { data, isLoading } = useTracker();
  const [popover, setPopover] = useState<{
    debtId: string;
    month: number;
  } | null>(null);

  const year = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const earliestDebt =
    data.debts.length > 0
      ? new Date(data.debts[data.debts.length - 1].created_at)
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-sm font-medium mb-8"
        >
          ← Back
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {year} Payment Tracker
          </h1>
          <p className="text-slate-400 text-sm">
            Every payment counts. Here's the full picture.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-slate-400">
            Loading tracker...
          </div>
        ) : data.debts.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            No active debts to track.
          </div>
        ) : (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr>
                  <th className="text-left text-xs text-slate-400 uppercase tracking-wider font-semibold pb-4 pr-6 min-w-40">
                    Debt
                  </th>
                  {months.map((month, idx) => (
                    <th
                      key={month}
                      className={`text-xs uppercase tracking-wider font-semibold pb-4 px-2 text-center ${
                        idx === currentMonth
                          ? "text-orange-400"
                          : "text-slate-400"
                      }`}
                    >
                      {month}
                      {idx === currentMonth && (
                        <div className="w-1 h-1 rounded-full bg-orange-400 mx-auto mt-1" />
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data.debts.map((debt) => (
                  <tr key={debt.id}>
                    <td className="py-4 pr-6">
                      <p className="text-white font-medium text-sm">
                        {debt.company}
                      </p>
                      <p className="text-slate-400 text-xs">
                        £{debt.monthly_amount}/mo
                      </p>
                    </td>
                    {months.map((month, idx) => {
                      const monthDate = new Date(year, idx, 1);

                      const isBeforeSignup = earliestDebt
                        ? monthDate <
                          new Date(
                            earliestDebt.getFullYear(),
                            earliestDebt.getMonth(),
                            1,
                          )
                        : false;

                      const status = isBeforeSignup
                        ? "before-signup"
                        : getDebtMonthStatus(debt, data.payments, idx, year);

                      const isPopoverOpen =
                        popover?.debtId === debt.id && popover?.month === idx;

                      return (
                        <td
                          key={month}
                          className="px-2 py-4 text-center relative"
                        >
                          <button
                            onClick={() => {
                              if (status === "missed" || status === "partial") {
                                setPopover(
                                  isPopoverOpen
                                    ? null
                                    : { debtId: debt.id, month: idx },
                                );
                              }
                            }}
                            className={`w-10 h-10 rounded-lg border flex items-center justify-center mx-auto transition-all ${
                              status === "before-signup"
                                ? "bg-slate-800/30 border-slate-800 text-slate-700 cursor-default"
                                : status === "current"
                                  ? "bg-orange-500/10 border-orange-500/30 text-orange-400 cursor-default"
                                  : status === "paid"
                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                    : status === "partial"
                                      ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 cursor-pointer"
                                      : status === "missed"
                                        ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 cursor-pointer"
                                        : "bg-slate-800 border-slate-700 text-slate-600"
                            }`}
                          >
                            {status === "paid" && <Check size={14} />}
                            {status === "partial" && <Minus size={14} />}
                            {status === "missed" && <X size={14} />}
                            {status === "current" && <MapPin size={14} />}
                            {(status === "future" ||
                              status === "before-signup") && (
                              <span className="text-xs">—</span>
                            )}
                          </button>

                          {/* Popover */}
                          {isPopoverOpen && (
                            <div className="absolute z-10 top-14 left-1/2 -translate-x-1/2 w-56 bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-xl text-left">
                              <p className="text-white text-sm font-semibold mb-1">
                                {status === "partial"
                                  ? "Partial payment logged"
                                  : "Payment not logged"}
                              </p>
                              <p className="text-slate-400 text-xs mb-3">
                                {status === "partial"
                                  ? "You paid less than the agreed amount. Want to log what happened?"
                                  : "Check your bank — what happened here?"}
                              </p>
                              <button
                                onClick={() =>
                                  router.push(
                                    `/tracker/${idx + 1}?debtId=${debt.id}`,
                                  )
                                }
                                className="w-full bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs font-medium py-2 rounded-lg hover:bg-purple-600/40 transition-all"
                              >
                                Log what happened →
                              </button>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
