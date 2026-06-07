"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useTracker, getDebtMonthStatus } from "@/lib/hooks/useTracker";
import { Check, Minus, X, ChevronRight } from "lucide-react";
import LogPaymentModal from "@/components/LogPaymentModal";
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
  const year = new Date().getFullYear();
  const { data, isLoading } = useTracker();
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

  const paymentTypeLabel = (type: string) => {
    if (type === "on-time")
      return {
        label: "On time",
        color: "text-emerald-600",
        icon: <Check size={12} />,
      };
    if (type === "late")
      return {
        label: "Late",
        color: "text-amber-600",
        icon: <ChevronRight size={12} />,
      };
    if (type === "partial")
      return {
        label: "Short payment",
        color: "text-amber-600",
        icon: <Minus size={12} />,
      };
    if (type === "partial-late")
      return {
        label: "Short & late",
        color: "text-red-500",
        icon: <X size={12} />,
      };
    if (type === "overpaid")
      return {
        label: "Overpaid 🎉",
        color: "text-sage-600",
        icon: <Check size={12} />,
      };
    return { label: type, color: "text-sage-500", icon: null };
  };

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
    <div className="p-4 md:p-6">
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => router.push("/tracker")}
          className="text-sage-500 hover:text-sage-700 transition-colors flex items-center gap-1 text-sm font-medium mb-8"
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
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center mb-6">
            <div className="text-4xl mb-3">🎉</div>
            <h2 className="text-xl font-bold text-emerald-700 mb-2">
              Nothing missed!
            </h2>
            <p className="text-emerald-600 text-sm">
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
                className="bg-white/60 backdrop-blur-sm border border-mint-200 rounded-2xl p-6 w-full md:w-[calc(50%-8px)] shadow-sm"
              >
                <div className="flex items-start justify-between mb-4 pb-4 border-b border-mint-100">
                  <div>
                    <h3 className="text-sage-800 font-semibold">
                      {debt.company}
                    </h3>
                    <p className="text-sage-400 text-xs mt-0.5">
                      £{debt.monthly_amount}/month agreed
                    </p>
                  </div>
                  <div
                    className={`w-8 h-8 rounded-lg border flex items-center justify-center ${
                      displayStatus === "paid"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                        : displayStatus === "partial"
                          ? "bg-amber-50 border-amber-200 text-amber-600"
                          : "bg-peach-100 border-peach-200 text-sage-400"
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
                      const typeInfo = paymentTypeLabel(payment.payment_type);
                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 bg-mint-50 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <span className={typeInfo.color}>
                              {typeInfo.icon}
                            </span>
                            <div>
                              <p className="text-sage-800 text-sm font-medium">
                                £{payment.amount}
                              </p>
                              <p className="text-sage-400 text-xs">
                                {payment.payment_date}
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
                  <p className="text-sage-400 text-sm mb-4">
                    No payment logged
                  </p>
                )}

                {details.notes.length > 0 && (
                  <div className="space-y-2 mb-4 pt-3 border-t border-mint-100">
                    {details.notes.map((note, i) => (
                      <div key={i} className="p-3 bg-peach-100/50 rounded-lg">
                        <p className="text-xs text-sage-400 uppercase tracking-wider font-semibold mb-1">
                          Note
                        </p>
                        <p className="text-sage-700 text-sm">{note.reason}</p>
                        {note.actions && (
                          <p className="text-sage-400 text-xs mt-1">
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
                    <p className="text-emerald-600 text-sm">
                      You're all good — payment made on time. Keep it up! 💪
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

      {logPaymentDebt && (
        <LogPaymentModal
          debt={logPaymentDebt}
          onClose={() => setLogPaymentDebt(null)}
          onSuccess={() => setLogPaymentDebt(null)}
        />
      )}
    </div>
  );
}
