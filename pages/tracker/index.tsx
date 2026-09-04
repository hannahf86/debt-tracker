"use client";

import { ordinal } from "@/lib/format";
import MobileTracker from "@/components/mobile/MobileTracker";
import { useState } from "react";
import { useRouter } from "next/router";
import {
  useTracker,
  getDebtStripMonthStatus,
  trackerStartMonth,
} from "@/lib/hooks/useTracker";
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

  const startMonth = trackerStartMonth(data.debts);

  const handleCellClick = async (debtId: string, monthIdx: number) => {
    router.push(`/tracker/${monthIdx + 1}`);
  };

  const typeLabel = (type: string) => {
    if (type === "on-time")
      return { label: "On time", color: "text-ok-600" };
    if (type === "late") return { label: "Late", color: "text-warn-600" };
    if (type === "partial")
      return { label: "Short payment", color: "text-warn-600" };
    if (type === "partial-late")
      return { label: "Short & late", color: "text-alert-600" };
    if (type === "overpaid")
      return { label: "Overpaid", color: "text-sage-600" };
    return { label: type, color: "text-sage-500" };
  };

  return (
    <>
      <div className="md:hidden">
        <MobileTracker data={data} isLoading={isLoading} />
      </div>

      <div className="hidden md:block p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => router.push("/dashboard")}
          className="hidden md:flex text-sage-500 hover:text-sage-700 transition-colors items-center gap-1 text-sm font-medium mb-8"
        >
          ← Back
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-sage-800 mb-2">
            {year} Payment Tracker
          </h1>
          <p className="text-sage-500 text-sm">
            Every payment counts. Here's the full picture.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-sage-500">
            Loading tracker...
          </div>
        ) : data.debts.length === 0 ? (
          <div className="text-center py-12 text-sage-500">
            No active debts to track.
          </div>
        ) : (
          <div className="bg-white border border-mint-200 rounded-2xl p-6 overflow-x-auto shadow-sm">
            <table className="w-full min-w-max">
              <thead>
                <tr>
                  <th className="text-left text-xs text-sage-500 uppercase tracking-wider font-semibold pb-4 pr-6 min-w-40">
                    Debt
                  </th>
                  {months.map((month, idx) => (
                    <th
                      key={month}
                      className={`text-xs uppercase tracking-wider font-semibold pb-4 px-2 text-center ${
                        idx === currentMonth
                          ? "text-now-600"
                          : "text-sage-500"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        {idx === currentMonth && (
                          <MapPin size={10} className="text-now-600" />
                        )}
                        {month}
                        {idx === currentMonth && (
                          <div className="w-1 h-1 rounded-full bg-now-200" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-mint-100">
                {data.debts.map((debt) => (
                  <tr key={debt.id}>
                    <td className="py-4 pr-6">
                      <p className="text-sage-800 font-medium text-sm">
                        {debt.company}
                      </p>
                      <p className="text-sage-500 text-xs">
                        £{debt.monthly_amount}/mo
                      </p>
                      {debt.direct_debit_date && (
                        <p className="text-sage-500 text-xs">
                          Due: {ordinal(debt.direct_debit_date)}
                        </p>
                      )}
                    </td>
                    {months.map((month, idx) => {
                      const status = getDebtStripMonthStatus(
                        debt,
                        data.payments,
                        idx,
                        year,
                        startMonth,
                      );
                      const isBeforeSignup = status === "before-signup";

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
                                ? "bg-peach-100/50 border-peach-200 text-peach-300 cursor-default"
                                : status === "current"
                                  ? "bg-now-100 border-now-200 text-now-600 hover:bg-now-200 cursor-pointer"
                                  : status === "paid"
                                    ? "bg-ok-100 border-ok-200 text-ok-600 hover:bg-ok-100 cursor-pointer"
                                    : status === "partial"
                                      ? "bg-warn-100 border-warn-200 text-warn-600 hover:bg-warn-100 cursor-pointer"
                                      : status === "missed"
                                        ? "bg-peach-100 border-peach-200 text-sage-500 hover:bg-peach-200 cursor-pointer"
                                        : "bg-peach-100/50 border-peach-200 text-peach-300"
                            }`}
                          >
                            {status === "paid" && <Check size={14} />}
                            {status === "partial" && <Minus size={14} />}
                            {status === "missed" && (
                              <span className="text-xs">—</span>
                            )}
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
    </>
  );
}
