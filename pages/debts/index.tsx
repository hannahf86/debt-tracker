"use client";

import { useRouter } from "next/router";
import { useDebts } from "@/lib/hooks/useDebts";
import { Plus, CreditCard, FileText, Zap, BarChart2, Pin } from "lucide-react";
import type { Debt } from "@/lib/types";

const arrangementConfig: Record<string, { label: string; dot: string }> = {
  "payment-plan": { label: "Payment plan in place", dot: "bg-emerald-400" },
  "needs-setting-up": { label: "Needs setting up", dot: "bg-blue-400" },
  "awaiting-response": { label: "Awaiting response", dot: "bg-amber-400" },
  "account-in-default": { label: "Account in default", dot: "bg-red-400" },
  default: { label: "Not set", dot: "bg-slate-400" },
};

const categoryIcon = (category: string) => {
  const cls = "w-5 h-5";
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

function calcClearedBy(
  amountOwed: number,
  monthlyAmount: number | null,
): string {
  if (!monthlyAmount || monthlyAmount <= 0) return "—";
  const monthsRemaining = Math.ceil(amountOwed / monthlyAmount);
  const clearedDate = new Date();
  clearedDate.setMonth(clearedDate.getMonth() + monthsRemaining);
  return clearedDate.toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  });
}

export default function DebtsPage() {
  const router = useRouter();
  const { debts, isLoading } = useDebts();

  const totalOwed = debts.reduce((sum, d) => sum + d.amount_owed, 0);
  const totalOriginal = debts.reduce((sum, d) => sum + d.total_amount, 0);
  const overallPercent =
    totalOriginal > 0
      ? Math.round(((totalOriginal - totalOwed) / totalOriginal) * 100)
      : 0;

  const getProgressPercent = (debt: Debt) =>
    Math.round(
      ((debt.total_amount - debt.amount_owed) / debt.total_amount) * 100,
    );

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Your debts</h1>
          <p className="text-slate-400 text-sm">All your debts in one place</p>
        </div>
        <button
          onClick={() => router.push("/debts/new")}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-500 hover:to-indigo-500 transition-all text-sm font-medium"
        >
          <Plus size={16} />
          Add debt
        </button>
      </div>

      {/* Summary cards */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-3">
            Total Remaining
          </p>
          <p className="text-3xl font-bold text-white">
            £{totalOwed.toLocaleString()}
          </p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-3">
            Total Original
          </p>
          <p className="text-3xl font-bold text-white">
            £{totalOriginal.toLocaleString()}
          </p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-3">
            Overall Progress
          </p>
          <p className="text-3xl font-bold text-white">{overallPercent}%</p>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Debt list */}
      <div className="max-w-5xl mx-auto">
        {isLoading ? (
          <div className="text-center py-12 text-slate-400">
            Loading your debts...
          </div>
        ) : debts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 mb-2">No debts added yet</p>
            <p className="text-slate-500 text-sm mb-6">
              Add your first debt to get started
            </p>
            <button
              onClick={() => router.push("/debts/new")}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-500 hover:to-indigo-500 transition-all text-sm font-medium"
            >
              Add first debt
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {debts.map((debt) => {
              const percent = getProgressPercent(debt);
              const clearedBy = calcClearedBy(
                debt.amount_owed,
                debt.monthly_amount,
              );

              return (
                <div
                  key={debt.id}
                  onClick={() => router.push(`/debts/${debt.id}`)}
                  className="debt-card bg-slate-900/50 border border-slate-800 rounded-xl p-6 cursor-pointer group hover:border-slate-700 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-slate-400">
                        {categoryIcon(debt.category)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">
                          {debt.company}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          £{debt.monthly_amount}/mo · Cleared by {clearedBy}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700">
                        <div
                          className={`w-2 h-2 rounded-full ${arrangementConfig[debt.arrangement ?? "default"].dot}`}
                        />
                        <span className="text-xs font-medium text-slate-300">
                          {
                            arrangementConfig[debt.arrangement ?? "default"]
                              .label
                          }
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">
                          £{debt.amount_owed.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-400">remaining</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-baseline mb-2">
                      <p className="text-xs text-slate-400">
                        £
                        {(
                          debt.total_amount - debt.amount_owed
                        ).toLocaleString()}{" "}
                        paid of £{debt.total_amount.toLocaleString()}
                      </p>
                      <p className="text-xs font-semibold text-purple-400">
                        {percent}%
                      </p>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
