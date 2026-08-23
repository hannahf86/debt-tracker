"use client";

import { useRouter } from "next/router";
import { Plus, ChevronRight, AlertCircle } from "lucide-react";
import type { Debt } from "@/lib/types";
import { clearedDate, formatMonthYear } from "@/lib/projection";
import { arrangementStyle } from "@/lib/arrangement";
import { missingDetails, incompleteDebts } from "@/lib/completeness";
import DueChip from "@/components/DueChip";
import { CategoryTile, ProgressBar, percentPaid, money } from "@/components/mobile/ui";

export default function MobileDebts({
  debts,
  isLoading,
}: {
  debts: Debt[];
  isLoading: boolean;
}) {
  const router = useRouter();

  const totalOwed = debts.reduce((sum, d) => sum + d.amount_owed, 0);
  const totalOriginal = debts.reduce((sum, d) => sum + d.total_amount, 0);
  const overall = percentPaid(totalOriginal, totalOwed);
  const needsDetails = incompleteDebts(debts);

  return (
    <div className="w-full max-w-full p-4 pb-10 flex flex-col gap-4">
      <header>
        <h1 className="font-display text-[1.75rem] leading-tight font-extrabold text-sage-800">
          Your debts
        </h1>
        <p className="text-sm text-sage-500 mt-1">All your debts in one place</p>
      </header>

      {/* Two stat tiles */}
      <div className="flex gap-3">
        <div className="flex-1 bg-white border border-mint-200 rounded-xl px-3.5 py-4">
          <p className="caps-label">Remaining</p>
          <p className="font-display text-[1.625rem] font-extrabold text-sage-800 mt-2">
            {money(totalOwed)}
          </p>
        </div>
        <div className="flex-1 bg-white border border-mint-200 rounded-xl px-3.5 py-4">
          <p className="caps-label">Progress</p>
          <p className="font-display text-[1.625rem] font-extrabold text-sage-800 mt-2">
            {overall}%
          </p>
          <div className="mt-2.5">
            <ProgressBar
              percent={overall}
              height={6}
              label={`${overall}% of everything you owe paid`}
            />
          </div>
        </div>
      </div>

      {/* An offer, not a telling-off. */}
      {!isLoading && needsDetails.length > 0 && (
        <div className="flex items-start gap-3 bg-warn-100 border border-warn-200 rounded-xl px-4 py-3.5">
          <AlertCircle size={18} className="text-warn-600 shrink-0 mt-0.5" />
          <p className="text-sm text-warn-700">
            {needsDetails.length}{" "}
            {needsDetails.length === 1 ? "debt could use" : "debts could use"} a
            few more details. Add them whenever you have them — no rush.
          </p>
        </div>
      )}

      {isLoading ? (
        <p className="text-center py-8 text-sage-500">Loading your debts...</p>
      ) : debts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sage-600 mb-1">No debts added yet</p>
          <p className="text-sm text-sage-500">
            Add your first one whenever you&rsquo;re ready.
          </p>
        </div>
      ) : (
        debts.map((debt) => {
          const percent = percentPaid(debt.total_amount, debt.amount_owed);
          const missing = missingDetails(debt);
          const arrangement = arrangementStyle(debt.arrangement);

          return (
            /* Whole card is the target — nothing inside it is interactive. */
            <button
              key={debt.id}
              onClick={() => router.push(`/debts/${debt.id}`)}
              className="w-full text-left bg-white border border-mint-200 rounded-xl shadow-sm p-4 active:bg-mint-100 transition-colors duration-fast"
            >
              <div className="flex items-center gap-3">
                <CategoryTile category={debt.category} />
                <span className="flex-1 min-w-0">
                  <span className="block font-display text-[1.125rem] font-bold text-sage-800 truncate">
                    {debt.company}
                  </span>
                  <span className="block text-xs text-sage-500 truncate">
                    {debt.monthly_amount ? `£${debt.monthly_amount}/mo · ` : ""}
                    cleared by {formatMonthYear(clearedDate(debt))}
                  </span>
                </span>
                <ChevronRight size={20} className="text-sage-400 shrink-0" />
              </div>

              <div className="flex justify-between items-baseline mt-3.5 mb-2 text-xs">
                <span className="text-sage-500">
                  {money(debt.total_amount - debt.amount_owed)} paid of{" "}
                  {money(debt.total_amount)}
                </span>
                <span className="font-bold text-brand">{percent}%</span>
              </div>

              <ProgressBar
                percent={percent}
                height={6}
                label={`${percent}% of ${debt.company} paid`}
              />

              <div className="flex flex-wrap items-center gap-2 mt-3">
                <DueChip dayOfMonth={debt.direct_debit_date} />
                <span
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-pill border ${arrangement.chip}`}
                >
                  <span className={`w-2 h-2 rounded-full ${arrangement.dot}`} />
                  <span className="text-xs font-medium whitespace-nowrap">
                    {arrangement.label}
                  </span>
                </span>
                {missing.length > 0 && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-pill border bg-warn-100 border-warn-200 text-warn-700">
                    <AlertCircle size={14} className="shrink-0" />
                    <span className="text-xs font-semibold whitespace-nowrap">
                      {missing.length}{" "}
                      {missing.length === 1 ? "detail" : "details"} to add
                    </span>
                  </span>
                )}
              </div>
            </button>
          );
        })
      )}

      <button
        onClick={() => router.push("/debts/new")}
        className="w-full flex items-center justify-center gap-2 min-h-[56px] rounded-xl border-2 border-dashed border-mint-300 text-sage-600 hover:text-brand hover:border-brand transition-colors duration-base text-sm font-semibold"
      >
        <Plus size={18} /> Add a debt
      </button>
    </div>
  );
}
