"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { useTracker, getDebtMonthStatus } from "@/lib/hooks/useTracker";
import { Check, X, Minus, MapPin, Loader } from "lucide-react";

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
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

type PopoverData = {
  debtId: string;
  month: number;
  payments: any[];
  notes: any[];
  isLoading: boolean;
};

export default function YearlyTrackerPage() {
  const router = useRouter();
  const { data, isLoading } = useTracker();
  const [popover, setPopover] = useState<PopoverData | null>(null);

  const year = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const earliestDebt =
    data.debts.length > 0
      ? new Date(data.debts[data.debts.length - 1].created_at)
      : null;

  const handleCellClick = async (debtId: string, monthIdx: number) => {
    router.push(`/tracker/${monthIdx + 1}`);
  };

  const typeLabel = (type: string) => {
    if (type === "on-time")
      return { label: "On time", color: "text-emerald-400" };
    if (type === "late") return { label: "Late", color: "text-amber-400" };
    if (type === "partial")
      return { label: "Short payment", color: "text-amber-400" };
    if (type === "partial-late")
      return { label: "Short & late", color: "text-red-400" };
    if (type === "overpaid")
      return { label: "Overpaid 🎉", color: "text-blue-400" };
    return { label: type, color: "text-slate-400" };
  };

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
                      <div className="flex flex-col items-center gap-1">
                        {idx === currentMonth && (
                          <MapPin size={10} className="text-orange-400" />
                        )}
                        {month}
                        {idx === currentMonth && (
                          <div className="w-1 h-1 rounded-full bg-orange-400" />
                        )}
                      </div>
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
                      {debt.direct_debit_date && (
                        <p className="text-slate-500 text-xs">
                          Due: {debt.direct_debit_date}th of the month
                        </p>
                      )}
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

                      const isClickable =
                        !isBeforeSignup && status !== "future";

                      return (
                        <td
                          key={month}
                          className="px-2 py-4 text-center relative"
                        >
                          <button
                            onClick={() =>
                              isClickable && handleCellClick(debt.id, idx)
                            }
                            className={`w-10 h-10 rounded-lg border flex items-center justify-center mx-auto transition-all ${
                              isBeforeSignup
                                ? "bg-slate-800/30 border-slate-800 text-slate-700 cursor-default"
                                : status === "current"
                                  ? "bg-orange-500/20 border-orange-500/40 cursor-pointer hover:bg-orange-500/30"
                                  : status === "paid"
                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 cursor-pointer"
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
                            {status === "current" && null}
                            {(status === "future" ||
                              status === "before-signup") && (
                              <span className="text-xs">—</span>
                            )}
                          </button>
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
