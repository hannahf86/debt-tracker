"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useDebts } from "@/lib/hooks/useDebts";
import {
  ChevronDown,
  Plus,
  CreditCard,
  Landmark,
  Zap,
  Receipt,
  Home,
  MoreHorizontal,
  Check,
  Minus,
  X,
  MapPin,
} from "lucide-react";
import type { Debt } from "@/lib/types";
import { useTracker, getMonthStatus } from "@/lib/hooks/useTracker";
import LogPaymentModal from "@/components/LogPaymentModal";

const arrangementConfig: Record<string, { label: string; dot: string }> = {
  "payment-plan": { label: "Payment plan in place", dot: "bg-emerald-500" },
  "needs-setting-up": { label: "Needs setting up", dot: "bg-blue-400" },
  "awaiting-response": { label: "Awaiting response", dot: "bg-amber-400" },
  "account-in-default": { label: "Account in default", dot: "bg-red-400" },
  default: { label: "Not set", dot: "bg-sage-400" },
};

const categoryIcon = (category: string) => {
  const cls = "w-5 h-5 text-sage-600";
  switch (category) {
    case "credit-card":
      return <CreditCard className={cls} />;
    case "loan":
      return <Landmark className={cls} />;
    case "utilities":
      return <Zap className={cls} />;
    case "tax":
      return <Receipt className={cls} />;
    case "household":
      return <Home className={cls} />;
    default:
      return <MoreHorizontal className={cls} />;
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
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-4xl font-bold text-sage-800 mb-2">Dashboard</h1>
        <p className="text-sage-600 text-sm">
          Track what you owe. Celebrate what you've paid. Watch it all get
          smaller!
        </p>
      </div>

      {/* Monthly Tracker */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-white/60 backdrop-blur-sm border border-mint-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-sage-600 uppercase tracking-wider">
              {new Date().getFullYear()} Payment History
            </h2>
            <button
              onClick={() => router.push("/tracker")}
              className="text-sm text-sage-600 hover:text-sage-800 transition-colors font-medium flex items-center gap-1"
            >
              View yearly tracker <ChevronDown size={14} />
            </button>
          </div>

          <div className="flex gap-3 flex-wrap">
            {months.map((month, idx) => {
              const monthDate = new Date(new Date().getFullYear(), idx, 1);
              const isBeforeSignup = monthDate;
              new Date(earliestDebt.getFullYear(), earliestDebt.getMonth(), 1);

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
                  <div
                    className={`text-xs font-medium ${idx === new Date().getMonth() ? "text-orange-500" : "text-sage-500"}`}
                  >
                    {month}
                  </div>
                  <button
                    onClick={() => {
                      const isCurrentMonth = idx === new Date().getMonth();
                      if (
                        isCurrentMonth ||
                        (monthStatus !== "future" &&
                          monthStatus !== "before-signup")
                      ) {
                        router.push(`/tracker/${idx + 1}`);
                      }
                    }}
                    className={`w-12 h-12 rounded-lg border flex items-center justify-center transition-all focus:outline-none hover:-translate-y-0.5 hover:shadow-md ${
                      isBeforeSignup
                        ? "bg-peach-100/30 border-peach-200/50 text-peach-300 cursor-default"
                        : monthStatus === "current"
                          ? "bg-orange-100 border-orange-300 text-orange-500 cursor-pointer hover:bg-orange-200 shadow-sm"
                          : monthStatus === "paid"
                            ? "bg-emerald-100 border-emerald-300 text-emerald-600 cursor-pointer hover:bg-emerald-200 shadow-sm"
                            : monthStatus === "partial"
                              ? "bg-amber-100 border-amber-300 text-amber-600 cursor-pointer hover:bg-amber-200 shadow-sm"
                              : monthStatus === "missed"
                                ? "bg-red-100 border-red-300 text-red-500 cursor-pointer hover:bg-red-200 shadow-sm"
                                : monthStatus === "future"
                                  ? "bg-white/40 border-mint-200 text-sage-300 cursor-default"
                                  : "bg-peach-100/50 border-peach-200 text-peach-300 cursor-default"
                    }`}
                  >
                    {!isBeforeSignup && monthStatus === "paid" && (
                      <Check size={16} />
                    )}
                    {!isBeforeSignup && monthStatus === "missed" && (
                      <X size={16} />
                    )}
                    {!isBeforeSignup && monthStatus === "partial" && (
                      <Minus size={16} />
                    )}
                    {!isBeforeSignup && monthStatus === "current" && (
                      <MapPin size={16} />
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
        <div className="bg-white/60 backdrop-blur-sm border border-mint-200 rounded-xl p-6 shadow-sm">
          <p className="text-sage-500 text-xs uppercase tracking-wider font-semibold mb-3">
            Total Debt
          </p>
          <p className="text-3xl font-bold text-sage-800">
            £{totalDebt.toLocaleString()}
          </p>
        </div>
        <div className="bg-white/60 backdrop-blur-sm border border-mint-200 rounded-xl p-6 shadow-sm">
          <p className="text-sage-500 text-xs uppercase tracking-wider font-semibold mb-3">
            Monthly Budget
          </p>
          <p className="text-3xl font-bold text-sage-800">£0</p>
          <p className="text-xs text-sage-400 mt-2">for debt repayment</p>
        </div>
        <div className="bg-white/60 backdrop-blur-sm border border-mint-200 rounded-xl p-6 shadow-sm">
          <p className="text-sage-500 text-xs uppercase tracking-wider font-semibold mb-3">
            Debt Cleared By
          </p>
          <p className="text-3xl font-bold text-sage-800">—</p>
        </div>
      </div>

      {/* Debt Cards */}
      <div className="max-w-6xl mx-auto">
        {isLoading ? (
          <div className="text-center py-12 text-sage-500">
            Loading your debts...
          </div>
        ) : debts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sage-500 mb-2">No debts added yet</p>
            <p className="text-sage-400 text-sm">
              Add your first debt to get started
            </p>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {debts.map((debt) => (
              <div
                key={debt.id}
                className="debt-card bg-white/60 backdrop-blur-sm border border-mint-200 rounded-xl p-6 cursor-pointer group shadow-sm hover:shadow-md"
                onClick={() => router.push(`/debts/${debt.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div>{categoryIcon(debt.category)}</div>
                    <div>
                      <h3 className="font-semibold text-sage-800 text-base">
                        {debt.company}
                      </h3>
                      {debt.direct_debit_date && (
                        <p className="text-xs text-sage-500 mt-0.5">
                          DD due: {debt.direct_debit_date}th
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleArrangement(debt);
                    }}
                    className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full bg-mint-100 border border-mint-200 hover:border-sage-300 transition-all"
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${arrangementConfig[debt.arrangement ?? "default"].dot}`}
                    />
                    <span className="text-xs font-medium text-sage-700">
                      {arrangementConfig[debt.arrangement ?? "default"].label}
                    </span>
                  </button>
                </div>

                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <p className="text-sm text-sage-700 font-medium">
                      £{(debt.total_amount - debt.amount_owed).toLocaleString()}{" "}
                      paid of £{debt.total_amount.toLocaleString()}
                    </p>
                    <p className="text-sm font-semibold text-accent">
                      {getProgressPercent(debt)}%
                    </p>
                  </div>
                  <div className="w-full h-2 bg-mint-100 rounded-full overflow-hidden mb-3">
                    <div
                      className="progress-bar h-full rounded-full"
                      style={{ width: `${getProgressPercent(debt)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-sage-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to see details
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLogPaymentDebt(debt);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-sage-600/10 hover:bg-sage-600/20 border border-sage-500/30 text-sage-700 text-xs font-semibold rounded-lg transition-all"
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
          className="w-full border-2 border-dashed border-sage-300 rounded-xl p-6 text-sage-400 hover:text-sage-600 hover:border-sage-400 transition-all group flex items-center justify-center gap-2"
        >
          <Plus
            size={20}
            className="group-hover:text-sage-600 transition-colors"
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
    </div>
  );
}
