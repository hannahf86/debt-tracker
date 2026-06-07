"use client";

import { useRouter } from "next/router";
import { useDebts } from "@/lib/hooks/useDebts";
import {
  Plus,
  CreditCard,
  Landmark,
  Zap,
  Receipt,
  Home,
  MoreHorizontal,
} from "lucide-react";
import type { Debt } from "@/lib/types";

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
          <h1 className="text-4xl font-bold text-sage-800 mb-2">Your debts</h1>
          <p className="text-sage-500 text-sm">All your debts in one place</p>
        </div>
        <button
          onClick={() => router.push("/debts/new")}
          className="flex items-center gap-2 px-4 py-2 bg-sage-600 hover:bg-sage-700 text-white rounded-xl transition-all text-sm font-medium"
        >
          <Plus size={16} />
          Add debt
        </button>
      </div>

      {/* Summary cards */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white/60 backdrop-blur-sm border border-mint-200 rounded-xl p-6 shadow-sm">
          <p className="text-sage-500 text-xs uppercase tracking-wider font-semibold mb-3">
            Total Remaining
          </p>
          <p className="text-3xl font-bold text-sage-800">
            £{totalOwed.toLocaleString()}
          </p>
        </div>
        <div className="bg-white/60 backdrop-blur-sm border border-mint-200 rounded-xl p-6 shadow-sm">
          <p className="text-sage-500 text-xs uppercase tracking-wider font-semibold mb-3">
            Total Original
          </p>
          <p className="text-3xl font-bold text-sage-800">
            £{totalOriginal.toLocaleString()}
          </p>
        </div>
        <div className="bg-white/60 backdrop-blur-sm border border-mint-200 rounded-xl p-6 shadow-sm">
          <p className="text-sage-500 text-xs uppercase tracking-wider font-semibold mb-3">
            Overall Progress
          </p>
          <p className="text-3xl font-bold text-sage-800">{overallPercent}%</p>
          <div className="w-full h-1.5 bg-mint-100 rounded-full mt-3 overflow-hidden">
            <div
              className="progress-bar h-full rounded-full"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Debt list */}
      <div className="max-w-5xl mx-auto">
        {isLoading ? (
          <div className="text-center py-12 text-sage-500">
            Loading your debts...
          </div>
        ) : debts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sage-500 mb-2">No debts added yet</p>
            <p className="text-sage-400 text-sm mb-6">
              Add your first debt to get started
            </p>
            <button
              onClick={() => router.push("/debts/new")}
              className="px-6 py-2 bg-sage-600 hover:bg-sage-700 text-white rounded-xl transition-all text-sm font-medium"
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
                  className="debt-card bg-white/60 backdrop-blur-sm border border-mint-200 rounded-xl p-6 cursor-pointer group hover:shadow-md shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div>{categoryIcon(debt.category)}</div>
                      <div>
                        <h3 className="font-semibold text-sage-800">
                          {debt.company}
                        </h3>
                        <p className="text-xs text-sage-500 mt-0.5">
                          £{debt.monthly_amount}/mo · Cleared by {clearedBy}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-mint-100 border border-mint-200">
                        <div
                          className={`w-2 h-2 rounded-full ${arrangementConfig[debt.arrangement ?? "default"].dot}`}
                        />
                        <span className="text-xs font-medium text-sage-700">
                          {
                            arrangementConfig[debt.arrangement ?? "default"]
                              .label
                          }
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sage-800 font-semibold">
                          £{debt.amount_owed.toLocaleString()}
                        </p>
                        <p className="text-xs text-sage-500">remaining</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-baseline mb-2">
                      <p className="text-xs text-sage-500">
                        £
                        {(
                          debt.total_amount - debt.amount_owed
                        ).toLocaleString()}{" "}
                        paid of £{debt.total_amount.toLocaleString()}
                      </p>
                      <p className="text-xs font-semibold text-sage-600">
                        {percent}%
                      </p>
                    </div>
                    <div className="w-full h-1.5 bg-mint-100 rounded-full overflow-hidden">
                      <div
                        className="progress-bar h-full rounded-full transition-all"
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
