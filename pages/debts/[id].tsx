"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useDebts } from "@/lib/hooks/useDebts";
import { getDebtMonthStatus } from "@/lib/hooks/useTracker";
import LogPaymentModal from "@/components/LogPaymentModal";
import { Check, Minus, X, MapPin, Trash2, Pencil } from "lucide-react";
import type { Debt, Payment } from "@/lib/types";

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

const arrangementConfig: Record<string, { label: string; dot: string }> = {
  "payment-plan": { label: "Payment plan in place", dot: "bg-emerald-400" },
  "needs-setting-up": { label: "Needs setting up", dot: "bg-blue-400" },
  "awaiting-response": { label: "Awaiting response", dot: "bg-amber-400" },
  "account-in-default": { label: "Account in default", dot: "bg-red-400" },
  default: { label: "Not set", dot: "bg-slate-400" },
};

function calcClearedBy(
  amountOwed: number,
  monthlyAmount: number | null,
): string {
  if (!monthlyAmount || monthlyAmount <= 0) return "—";
  const monthsRemaining = Math.ceil(amountOwed / monthlyAmount);
  const clearedDate = new Date();
  clearedDate.setMonth(clearedDate.getMonth() + monthsRemaining);
  return clearedDate.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

function ProgressRing({ percent }: { percent: number }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="160" height="160" className="-rotate-90">
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="#1e293b"
          strokeWidth="12"
        />
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-700"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <p className="text-2xl font-bold text-white">{percent}%</p>
        <p className="text-xs text-slate-400">paid</p>
      </div>
    </div>
  );
}

export default function DebtDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const { debts, updateDebt, deleteDebt } = useDebts();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [logPaymentDebt, setLogPaymentDebt] = useState<Debt | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const debt = debts.find((d) => d.id === id);
  const year = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  useEffect(() => {
    if (!id) return;
    fetch(`/api/payments?debtId=${id}`)
      .then((res) => res.json())
      .then((data) => setPayments(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [id]);

  if (!debt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  const percent = Math.round(
    ((debt.total_amount - debt.amount_owed) / debt.total_amount) * 100,
  );
  const clearedBy = calcClearedBy(debt.amount_owed, debt.monthly_amount);

  const earliestPayment =
    payments.length > 0
      ? new Date(payments[payments.length - 1].payment_date)
      : new Date();

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this debt? This cannot be undone.",
      )
    )
      return;
    setIsDeleting(true);
    await deleteDebt(debt.id);
    router.push("/dashboard");
  };

  const getMonthStatus = (monthIdx: number) => {
    const now = new Date();
    if (monthIdx > now.getMonth() && year === now.getFullYear())
      return "future";

    const monthStr = `${year}-${String(monthIdx + 1).padStart(2, "0")}`;
    const monthPayments = payments.filter((p) =>
      p.payment_date.startsWith(monthStr),
    );
    const totalPaid = monthPayments.reduce((sum, p) => sum + p.amount, 0);
    const expected = debt.monthly_amount || 0;

    if (
      year === now.getFullYear() &&
      monthIdx === now.getMonth() &&
      totalPaid === 0
    )
      return "current";
    if (totalPaid === 0) return "missed";
    if (expected > 0 && totalPaid < expected) return "partial";
    return "paid";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-sm font-medium mb-8"
        >
          ← Back
        </button>

        {/* Main card */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left column */}
            <div>
              {/* CRUD + Arrangement */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/debts/${debt.id}/edit`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-all"
                  >
                    <Pencil size={12} />
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-medium transition-all"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </div>
              </div>

              {/* Company name */}
              <h1 className="text-3xl font-bold text-white mb-6">
                {debt.company}
              </h1>

              {/* Debt details */}
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-3 border-b border-slate-800">
                  <p className="text-slate-400 text-sm">
                    Total owed (original)
                  </p>
                  <p className="text-white font-medium">
                    £{debt.total_amount.toLocaleString()}
                  </p>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-800">
                  <p className="text-slate-400 text-sm">Monthly DD</p>
                  <p className="text-white font-medium">
                    £{debt.monthly_amount?.toLocaleString() ?? "—"}
                  </p>
                </div>
                {debt.company_email && (
                  <div className="flex justify-between items-center py-3 border-b border-slate-800">
                    <p className="text-slate-400 text-sm">Contact email</p>
                    <a
                      href={`mailto:${debt.company_email}`}
                      className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
                    >
                      {debt.company_email}
                    </a>
                  </div>
                )}
                {debt.account_reference && (
                  <div className="flex justify-between items-center py-3 border-b border-slate-800">
                    <p className="text-slate-400 text-sm">Account ref</p>
                    <p className="text-white font-medium">
                      {debt.account_reference}
                    </p>
                  </div>
                )}
                <div className="flex justify-between items-center py-3">
                  <p className="text-slate-400 text-sm">Debt cleared by</p>
                  <p className="text-white font-medium">{clearedBy}</p>
                </div>
              </div>

              <button
                onClick={() => setLogPaymentDebt(debt)}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 rounded-xl hover:from-purple-500 hover:to-indigo-500 transition-all"
              >
                + Log payment
              </button>
            </div>

            {/* Right column */}
            <div className="flex flex-col items-center justify-center gap-6">
              {/* Arrangement pill */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700">
                <div
                  className={`w-2 h-2 rounded-full ${arrangementConfig[debt.arrangement ?? "default"].dot}`}
                />
                <span className="text-xs font-medium text-slate-300">
                  {arrangementConfig[debt.arrangement ?? "default"].label}
                </span>
              </div>

              <ProgressRing percent={percent} />

              <div className="text-center">
                <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">
                  Total remaining
                </p>
                <p className="text-4xl font-bold text-white">
                  £{debt.amount_owed.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Yearly tracker for this debt */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">
            {year} Payment History
          </h2>
          <div className="grid grid-cols-12 gap-3">
            {" "}
            {months.map((month, idx) => {
              const status = getMonthStatus(idx);
              const isClickable =
                status !== "future" && status !== "before-signup";

              return (
                <div key={month} className="flex flex-col items-center gap-2">
                  <div
                    className={`text-xs font-medium ${idx === currentMonth ? "text-orange-400" : "text-slate-400"}`}
                  >
                    {month}
                  </div>
                  <button
                    onClick={() => isClickable && setLogPaymentDebt(debt)}
                    className={`w-12 h-12 rounded-lg border flex items-center justify-center transition-all ${
                      status === "current"
                        ? "bg-orange-500/20 border-orange-500/40 cursor-pointer hover:bg-orange-500/30"
                        : status === "paid"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 cursor-pointer"
                          : status === "partial"
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 cursor-pointer"
                            : status === "missed"
                              ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 cursor-pointer"
                              : "bg-slate-800 border-slate-700 text-slate-600 cursor-default"
                    }`}
                  >
                    {status === "paid" && <Check size={16} />}
                    {status === "partial" && <Minus size={16} />}
                    {status === "missed" && <span className="text-xs">—</span>}
                    {status === "current" && null}
                    {status === "future" && <span className="text-xs">—</span>}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Log Payment Modal */}
      {logPaymentDebt && (
        <LogPaymentModal
          debt={logPaymentDebt}
          onClose={() => setLogPaymentDebt(null)}
          onSuccess={(newAmountOwed) => {
            updateDebt(debt.id, { amount_owed: newAmountOwed });
            setLogPaymentDebt(null);
          }}
        />
      )}
    </div>
  );
}
