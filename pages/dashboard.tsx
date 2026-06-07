"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useDebts } from "@/lib/hooks/useDebts";
import type { Debt } from "@/lib/types";
import { useTracker, getMonthStatus } from "@/lib/hooks/useTracker";
import LogPaymentModal from "@/components/LogPaymentModal";
import {
  ChevronDown,
  X,
  Plus,
  LogOut,
  CreditCard,
  FileText,
  Zap,
  BarChart2,
  Pin,
  Check,
  Minus,
  MapPin,
} from "lucide-react";

const arrangementConfig: Record<string, { label: string; dot: string }> = {
  "payment-plan": { label: "Payment plan in place", dot: "bg-emerald-400" },
  "needs-setting-up": { label: "Needs setting up", dot: "bg-blue-400" },
  "awaiting-response": { label: "Awaiting response", dot: "bg-amber-400" },
  "account-in-default": { label: "Account in default", dot: "bg-red-400" },
  default: { label: "Not set", dot: "bg-slate-400" },
};

const categoryIcon = (category: string) => {
  const cls = "w-6 h-6";
  switch (category) {
    case "credit-card":
      return <CreditCard className={cls} />;
    case "loan":
      return <FileText className={cls} />;
    case "utilities":
      return <Zap className={cls} />;
    case "tax":
      return <BarChart2 className={cls} />;
    default:
      return <Pin className={cls} />;
  }
};

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

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { debts, isLoading, updateDebt } = useDebts();
  const { data: trackerData, isLoading: isTrackerLoading } = useTracker();

  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [logPaymentDebt, setLogPaymentDebt] = useState<Debt | null>(null);

  if (status === "unauthenticated") {
    router.push("/auth/login");
    return null;
  }

  const totalDebt = debts.reduce((sum, d) => sum + d.amount_owed, 0);

  const getProgressPercent = (debt: Debt) =>
    Math.round(
      ((debt.total_amount - debt.amount_owed) / debt.total_amount) * 100,
    );

  const toggleArrangement = async (debt: Debt) => {
    const arrangements: Debt["arrangement"][] = [
      "payment-plan",
      "needs-setting-up",
      "awaiting-response",
      "account-in-default",
    ];
    const current = debt.arrangement ?? "payment-plan";
    const next =
      arrangements[(arrangements.indexOf(current) + 1) % arrangements.length];
    await updateDebt(debt.id, { arrangement: next });
  };

  const earliestDebt =
    trackerData.debts.length > 0
      ? new Date(trackerData.debts[trackerData.debts.length - 1].created_at)
      : new Date();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Your debts</h1>
          <p className="text-slate-400 text-sm">
            Track what you owe, celebrate what you've paid
          </p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>

      {/* Monthly Tracker */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              {new Date().getFullYear()} Payment History
            </h2>
            <button
              onClick={() => router.push("/tracker")}
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors font-medium flex items-center gap-1"
            >
              View yearly tracker <ChevronDown size={14} />
            </button>
          </div>

          <div className="flex gap-3 flex-wrap">
            {months.map((month, idx) => {
              const monthDate = new Date(new Date().getFullYear(), idx, 1);
              const isBeforeSignup =
                monthDate <
                new Date(
                  earliestDebt.getFullYear(),
                  earliestDebt.getMonth(),
                  1,
                );
              const monthStatus =
                isTrackerLoading || isBeforeSignup
                  ? "future"
                  : getMonthStatus(
                      trackerData.debts,
                      trackerData.payments,
                      idx,
                      new Date().getFullYear(),
                    );

              return (
                <div key={month} className="flex flex-col items-center gap-2">
                  <div className="text-xs text-slate-400 font-medium">
                    {month}
                  </div>
                  <button
                    onClick={() =>
                      !isBeforeSignup &&
                      (monthStatus === "missed" || monthStatus === "partial") &&
                      router.push(`/tracker/${idx + 1}`)
                    }
                    className={`w-12 h-12 rounded-lg border flex items-center justify-center transition-all ${
                      isBeforeSignup
                        ? "bg-slate-800/30 border-slate-800 text-slate-700 cursor-default"
                        : monthStatus === "current"
                          ? "bg-orange-500/10 border-orange-500/30 text-orange-400 cursor-default"
                          : monthStatus === "paid"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : monthStatus === "partial"
                              ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 cursor-pointer"
                              : monthStatus === "missed"
                                ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 cursor-pointer"
                                : "bg-slate-800 border-slate-700 text-slate-600"
                    }`}
                  >
                    {!isBeforeSignup && monthStatus === "paid" && (
                      <Check size={18} />
                    )}
                    {!isBeforeSignup && monthStatus === "missed" && (
                      <X size={18} />
                    )}
                    {!isBeforeSignup && monthStatus === "partial" && (
                      <Minus size={18} />
                    )}
                    {!isBeforeSignup && monthStatus === "current" && (
                      <MapPin size={18} />
                    )}
                    {(isBeforeSignup || monthStatus === "future") && (
                      <span className="text-xs">—</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-3">
            Total Debt
          </p>
          <p className="text-3xl font-bold text-white">
            £{totalDebt.toLocaleString()}
          </p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-3">
            Monthly Budget
          </p>
          <p className="text-3xl font-bold text-white">£0</p>
          <p className="text-xs text-slate-400 mt-2">for debt repayment</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-3">
            Debt Cleared By
          </p>
          <p className="text-3xl font-bold text-white">—</p>
        </div>
      </div>

      {/* Debt Cards */}
      <div className="max-w-6xl mx-auto">
        {isLoading ? (
          <div className="text-center py-12 text-slate-400">
            Loading your debts...
          </div>
        ) : debts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 mb-2">No debts added yet</p>
            <p className="text-slate-500 text-sm">
              Add your first debt to get started
            </p>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {debts.map((debt) => (
              <div
                key={debt.id}
                className="debt-card bg-slate-900/50 border border-slate-800 rounded-xl p-6 cursor-pointer group"
                onClick={() => router.push(`/debts/${debt.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="text-2xl">
                      <div className="text-slate-400">
                        {categoryIcon(debt.category)}
                      </div>{" "}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-base">
                        {debt.company}
                      </h3>
                      {debt.direct_debit_date && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          DD due: {debt.direct_debit_date}th
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/debts/${debt.id}`)}
                    className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all"
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${arrangementConfig[debt.arrangement ?? "default"].dot}`}
                    />
                    <span className="text-xs font-medium text-slate-300">
                      {arrangementConfig[debt.arrangement ?? "default"].label}
                    </span>
                  </button>
                </div>

                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <p className="text-sm text-white font-medium">
                      £{(debt.total_amount - debt.amount_owed).toLocaleString()}{" "}
                      paid of £{debt.total_amount.toLocaleString()}
                    </p>
                    <p className="text-sm font-semibold text-accent">
                      {getProgressPercent(debt)}%
                    </p>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-3">
                    <div
                      className="progress-bar h-full rounded-full"
                      style={{ width: `${getProgressPercent(debt)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to see details
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLogPaymentDebt(debt);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 text-purple-300 text-xs font-semibold rounded-lg transition-all"
                    >
                      + Log payment
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => router.push("/debts/new")}
          className="w-full border-2 border-dashed border-slate-700 rounded-xl p-6 text-slate-400 hover:text-white hover:border-purple-500/50 transition-all group flex items-center justify-center gap-2"
        >
          <Plus
            size={20}
            className="group-hover:text-purple-400 transition-colors"
          />
          <span className="font-medium">Add a debt</span>
        </button>
      </div>

      {/* Log Payment Modal */}
      {logPaymentDebt && (
        <LogPaymentModal
          debt={logPaymentDebt}
          onClose={() => setLogPaymentDebt(null)}
          onSuccess={(newAmountOwed) => {
            updateDebt(logPaymentDebt.id, { amount_owed: newAmountOwed });
            setTimeout(() => setLogPaymentDebt(null), 2500);
          }}
        />
      )}

      {/* Detail Modal */}
      {selectedDebt && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end z-50 p-4"
          onClick={() => router.push(`/debts/${selectedDebt.id}`)}
        >
          <div
            className="w-full max-w-2xl bg-gradient-to-br from-slate-900 to-slate-950 border-t border-slate-800 rounded-t-2xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => router.push(`/debts/${selectedDebt.id}`)}
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-sm font-medium mb-4"
            >
              ← Back
            </button>
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {selectedDebt.company}
              </h2>
              <button
                onClick={() => router.push(`/debts/${selectedDebt.id}`)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-baseline mb-3">
                <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold">
                  Progress
                </p>
                <p className="text-2xl font-bold text-accent">
                  {getProgressPercent(selectedDebt)}%
                </p>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden mb-3">
                <div
                  className="progress-bar h-full rounded-full"
                  style={{ width: `${getProgressPercent(selectedDebt)}%` }}
                />
              </div>
              <p className="text-sm text-white font-medium">
                £
                {(
                  selectedDebt.total_amount - selectedDebt.amount_owed
                ).toLocaleString()}{" "}
                paid of £{selectedDebt.total_amount.toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b border-slate-800">
              {selectedDebt.account_reference && (
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">
                    Account Ref
                  </p>
                  <p className="text-white font-medium">
                    {selectedDebt.account_reference}
                  </p>
                </div>
              )}
              {selectedDebt.direct_debit_date && (
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">
                    DD Date
                  </p>
                  <p className="text-white font-medium">
                    {selectedDebt.direct_debit_date}th of month
                  </p>
                </div>
              )}
              {selectedDebt.company_email && (
                <div className="col-span-2">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">
                    Email
                  </p>
                  <a
                    href={`mailto:${selectedDebt.company_email}`}
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    {selectedDebt.company_email}
                  </a>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  router.push(`/debts/${selectedDebt.id}/log-payment`);
                }}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium py-3 rounded-lg hover:from-purple-500 hover:to-indigo-500 transition-all"
              >
                Log payment
              </button>
              <button
                onClick={() => router.push(`/debts/${selectedDebt.id}/edit`)}
                className="flex-1 bg-slate-800 text-white font-medium py-3 rounded-lg hover:bg-slate-700 transition-colors"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
