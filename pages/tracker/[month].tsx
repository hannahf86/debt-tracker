"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useTracker, getDebtMonthStatus } from "@/lib/hooks/useTracker";
import { Check, Minus, X, ChevronRight, CheckCircle } from "lucide-react";
import LogPaymentModal from "@/components/LogPaymentModal";
import MobileMonth from "@/components/mobile/MobileMonth";
import { paymentTypeStyle, formatDayMonth } from "@/lib/paymentType";
import type { Debt } from "@/lib/types";

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

type PaymentDetail = {
  id: string;
  amount: number;
  payment_date: string;
  payment_type: string;
};

type NoteDetail = {
  id: string;
  reason: string;
  actions: string | null;
  due_date: string | null;
};

type DebtDetails = {
  [debtId: string]: {
    payments: PaymentDetail[];
    notes: NoteDetail[];
  };
};

export default function MonthTrackerPage() {
  const router = useRouter();
  const { month } = router.query;
  const monthIndex = parseInt(month as string) - 1;

  // Default a payment logged here to this month. Use today's date when it's
  // the current month, otherwise the last day of that month.
  const defaultDateForMonth = (() => {
    if (isNaN(monthIndex)) return undefined;
    const now = new Date();
    const y = now.getFullYear();
    if (monthIndex === now.getMonth()) return now.toISOString().split("T")[0];
    const lastDay = new Date(y, monthIndex + 1, 0).getDate();
    return `${y}-${String(monthIndex + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  })();
  const year = new Date().getFullYear();
  const { data, isLoading, fetchTracker } = useTracker();
  const [debtDetails, setDebtDetails] = useState<DebtDetails>({});
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [logPaymentDebt, setLogPaymentDebt] = useState<Debt | null>(null);

  useEffect(() => {
    if (!data.debts.length || isNaN(monthIndex)) return;

    const fetchAllDetails = async () => {
      setLoadingDetails(true);
      const details: DebtDetails = {};

      await Promise.all(
        data.debts.map(async (debt) => {
          try {
            const res = await fetch(
              `/api/tracker/notes?debtId=${debt.id}&month=${monthIndex + 1}&year=${year}`,
            );
            const json = await res.json();
            details[debt.id] = {
              payments: json.payments || [],
              notes: json.notes || [],
            };
          } catch {
            details[debt.id] = { payments: [], notes: [] };
          }
        }),
      );

      setDebtDetails(details);
      setLoadingDetails(false);
    };

    fetchAllDetails();
  }, [data.debts, monthIndex, year]);

  if (isLoading || loadingDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sage-500">Loading...</p>
      </div>
    );
  }

  const allGood = data.debts.every((debt) => {
    const status = getDebtMonthStatus(debt, data.payments, monthIndex, year);
    return status === "paid";
  });

  return (
    <>
      <div className="md:hidden">
        <MobileMonth
          monthName={monthNames[monthIndex]}
          year={year}
          debts={data.debts}
          details={debtDetails}
          onLogPayment={setLogPaymentDebt}
        />
      </div>

      <div className="hidden md:block p-4 md:p-6">
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => router.push("/tracker")}
          className="hidden md:flex text-sage-500 hover:text-sage-700 transition-colors items-center gap-1 text-sm font-medium mb-8"
        >
          ← Back to tracker
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-sage-800 mb-2">
            {monthNames[monthIndex]} {year}
          </h1>
          <p className="text-sage-500 text-sm">
            Here's the full picture for this month
          </p>
        </div>

        {allGood && (
          <div className="bg-ok-100 border border-ok-200 rounded-2xl p-6 text-center mb-6">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-3 rounded-pill bg-ok-100 border border-ok-200 text-ok-600">
              <CheckCircle size={32} />
            </div>
            <h2 className="text-xl font-bold text-ok-700 mb-2">
              Nothing missed!
            </h2>
            <p className="text-ok-600 text-sm">
              All payments were logged this month. Seriously, great work.
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-4">
          {data.debts.map((debt) => {
            const details = debtDetails[debt.id] || { payments: [], notes: [] };
            const hasPayments = details.payments.length > 0;
            const isPartial =
              hasPayments && debt.monthly_amount
                ? details.payments.reduce((sum, p) => sum + p.amount, 0) <
                  debt.monthly_amount
                : false;
            const displayStatus = !hasPayments
              ? "missed"
              : isPartial
                ? "partial"
                : "paid";

            return (
              <div
                key={debt.id}
                className="bg-white border border-mint-200 rounded-2xl p-6 w-full md:w-[calc(50%-8px)] shadow-sm"
              >
                <div className="flex items-start justify-between mb-4 pb-4 border-b border-mint-100">
                  <div>
                    <h3 className="text-sage-800 font-semibold">
                      {debt.company}
                    </h3>
                    <p className="text-sage-500 text-xs mt-0.5">
                      £{debt.monthly_amount}/month agreed
                    </p>
                  </div>
                  <div
                    className={`w-8 h-8 rounded-lg border flex items-center justify-center ${
                      displayStatus === "paid"
                        ? "bg-ok-100 border-ok-200 text-ok-600"
                        : displayStatus === "partial"
                          ? "bg-warn-100 border-warn-200 text-warn-600"
                          : "bg-peach-100 border-peach-200 text-sage-500"
                    }`}
                  >
                    {displayStatus === "paid" && <Check size={14} />}
                    {displayStatus === "partial" && <Minus size={14} />}
                    {displayStatus === "missed" && (
                      <span className="text-xs">—</span>
                    )}
                  </div>
                </div>

                {details.payments.length > 0 ? (
                  <div className="space-y-2 mb-4">
                    {details.payments.map((payment, i) => {
                      const typeInfo = paymentTypeStyle(payment.payment_type);
                      const TypeIcon = typeInfo.Icon;
                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 bg-mint-50 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <TypeIcon size={14} className={typeInfo.color} />
                            <div>
                              <p className="text-sage-800 text-sm font-medium">
                                £{payment.amount}
                              </p>
                              <p className="text-sage-500 text-xs">
                                {formatDayMonth(payment.payment_date)}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`text-xs font-medium ${typeInfo.color}`}
                          >
                            {typeInfo.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sage-500 text-sm mb-4">
                    No payment logged
                  </p>
                )}

                {details.notes.length > 0 && (
                  <div className="space-y-2 mb-4 pt-3 border-t border-mint-100">
                    {details.notes.map((note, i) => (
                      <div key={i} className="p-3 bg-peach-100/50 rounded-lg">
                        <p className="text-xs text-sage-500 uppercase tracking-wider font-semibold mb-1">
                          Note
                        </p>
                        <p className="text-sage-700 text-sm">{note.reason}</p>
                        {note.actions && (
                          <p className="text-sage-500 text-xs mt-1">
                            → {note.actions}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {hasPayments &&
                  details.notes.length === 0 &&
                  displayStatus === "paid" && (
                    <p className="text-ok-600 text-sm">
                      You're all good — payment made on time. Keep it up
                    </p>
                  )}

                <button
                  onClick={() => setLogPaymentDebt(debt)}
                  className="w-full mt-3 bg-sage-600 hover:bg-sage-700 text-white text-xs font-medium py-2 rounded-lg transition-all"
                >
                  + Log payment
                </button>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => router.push("/dashboard")}
          className="w-full mt-6 bg-mint-100 hover:bg-mint-200 text-sage-700 font-medium py-3 rounded-xl transition-colors border border-mint-200"
        >
          Back to dashboard
        </button>
      </div>
      </div>

      {logPaymentDebt && (
        <LogPaymentModal
          debt={logPaymentDebt}
          // Logging from a month's view should default to that month, not today.
          defaultDate={defaultDateForMonth}
          onClose={() => setLogPaymentDebt(null)}
          onSuccess={() => {
            // Without this the grid keeps rendering the payments fetched on
            // mount, so a payment just logged doesn't appear until a reload.
            fetchTracker();
            setLogPaymentDebt(null);
          }}
        />
      )}
    </>
  );
}
