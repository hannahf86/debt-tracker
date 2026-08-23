"use client";

import { useRouter } from "next/router";
import { useDebts } from "@/lib/hooks/useDebts";
import {
  Plus,
  AlertCircle,
  CreditCard,
  Landmark,
  Zap,
  Receipt,
  Home,
  MoreHorizontal,
} from "lucide-react";
import type { Debt } from "@/lib/types";
import { arrangementStyle } from "@/lib/arrangement";
import { clearedDate, formatMonthYear } from "@/lib/projection";
import { missingDetails, incompleteDebts } from "@/lib/completeness";
import DueChip from "@/components/DueChip";
import MobileDebts from "@/components/mobile/MobileDebts";

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

export default function DebtsPage() {
  const router = useRouter();
  const { debts, isLoading } = useDebts();

  const totalOwed = debts.reduce((sum, d) => sum + d.amount_owed, 0);
  const totalOriginal = debts.reduce((sum, d) => sum + d.total_amount, 0);
  const overallPercent =
    totalOriginal > 0
      ? Math.round(((totalOriginal - totalOwed) / totalOriginal) * 100)
      : 0;

  const needsDetails = incompleteDebts(debts);

  const getProgressPercent = (debt: Debt) =>
    Math.round(
      ((debt.total_amount - debt.amount_owed) / debt.total_amount) * 100,
    );

  return (
    <>
      <div className="md:hidden">
        <MobileDebts debts={debts} isLoading={isLoading} />
      </div>

      <div className="hidden md:block p-4 md:p-6">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-sage-800 mb-2">Your debts</h1>
          <p className="text-sage-500 text-sm">All your debts in one place</p>
        </div>
        <button
          onClick={() => router.push("/debts/new")}
          className="flex items-center justify-center gap-2 px-4 min-h-[48px] bg-sage-600 hover:bg-sage-700 text-white rounded-pill transition-all text-sm font-medium shrink-0 self-start"
        >
          <Plus size={16} />
          Add debt
        </button>
      </div>

      {/* Summary cards */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-mint-200 rounded-xl p-6 shadow-sm">
          <p className="text-sage-500 text-xs uppercase tracking-wider font-semibold mb-3">
            Total Remaining
          </p>
          <p className="text-3xl font-bold text-sage-800">
            £{totalOwed.toLocaleString()}
          </p>
        </div>
        <div className="bg-white border border-mint-200 rounded-xl p-6 shadow-sm">
          <p className="text-sage-500 text-xs uppercase tracking-wider font-semibold mb-3">
            Total Original
          </p>
          <p className="text-3xl font-bold text-sage-800">
            £{totalOriginal.toLocaleString()}
          </p>
        </div>
        <div className="bg-white border border-mint-200 rounded-xl p-6 shadow-sm">
          <p className="text-sage-500 text-xs uppercase tracking-wider font-semibold mb-3">
            Overall Progress
          </p>
          <p className="text-3xl font-bold text-sage-800">{overallPercent}%</p>
          <div className="w-full h-1.5 bg-mint-100 rounded-pill mt-3 overflow-hidden">
            <div
              className="progress-bar h-full rounded-pill"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Details still outstanding — an offer, not a telling-off. */}
      {!isLoading && needsDetails.length > 0 && (
        <div className="max-w-5xl mx-auto mb-4">
          <div className="flex items-start gap-3 bg-warn-100 border border-warn-200 rounded-xl px-5 py-4">
            <AlertCircle size={18} className="text-warn-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-warn-700">
                {needsDetails.length}{" "}
                {needsDetails.length === 1 ? "debt is" : "debts are"} missing
                details
              </p>
              <p className="text-sm text-sage-600 mt-0.5">
                Payment dates, references and contact emails help Mirian track
                things properly. Add them whenever you have them to hand — no
                rush.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Debt list */}
      <div className="max-w-5xl mx-auto">
        {isLoading ? (
          <div className="text-center py-12 text-sage-500">
            Loading your debts...
          </div>
        ) : debts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sage-500 mb-2">No debts added yet</p>
            <p className="text-sage-500 text-sm mb-6">
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
              const clearedBy = formatMonthYear(clearedDate(debt));
              const missing = missingDetails(debt);

              return (
                <div
                  key={debt.id}
                  onClick={() => router.push(`/debts/${debt.id}`)}
                  className="debt-card bg-white border border-mint-200 rounded-xl p-6 cursor-pointer group hover:shadow-md shadow-sm transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="shrink-0">{categoryIcon(debt.category)}</div>
                      <div>
                        <h3 className="font-semibold text-sage-800 truncate">
                          {debt.company}
                        </h3>
                        <p className="text-xs text-sage-500 mt-0.5">
                          £{debt.monthly_amount}/mo · Cleared by {clearedBy}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <DueChip dayOfMonth={debt.direct_debit_date} />
                      {missing.length > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-pill border bg-warn-100 border-warn-200 text-warn-600 shrink-0">
                          <AlertCircle size={14} className="shrink-0" />
                          <span className="text-xs font-semibold">
                            {missing.length}{" "}
                            {missing.length === 1 ? "detail" : "details"} to add
                          </span>
                        </div>
                      )}
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-pill border ${arrangementStyle(debt.arrangement).chip}`}>
                        <div
                          className={`w-2 h-2 rounded-full ${arrangementStyle(debt.arrangement).dot}`}
                        />
                        <span className="text-xs font-medium whitespace-nowrap">
                          {
                            arrangementStyle(debt.arrangement).label
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
                    <div className="w-full h-1.5 bg-mint-100 rounded-pill overflow-hidden">
                      <div
                        className="progress-bar h-full rounded-pill transition-all"
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
    </>
  );
}
