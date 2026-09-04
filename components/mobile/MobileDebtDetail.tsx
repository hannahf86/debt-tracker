"use client";

import { useRouter } from "next/router";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Debt, Payment } from "@/lib/types";
import { clearedDate, formatMonthYear } from "@/lib/projection";
import { arrangementStyle } from "@/lib/arrangement";
import { ordinal } from "@/lib/format";
import {
  getDebtStripMonthStatus,
  startOfMonth,
  type MonthStatus,
} from "@/lib/hooks/useTracker";
import MonthCell from "@/components/mobile/MonthCell";
import { MONTHS, ProgressBar, percentPaid, money } from "@/components/mobile/ui";

function Ring({ percent }: { percent: number }) {
  const size = 168;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          style={{ stroke: "var(--progress-track)" }}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#ringFill)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (percent / 100) * circumference}
          className="transition-all duration-[600ms] ease-out"
        />
        <defs>
          <linearGradient id="ringFill" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: "rgb(var(--teal-600))" }} />
            <stop offset="100%" style={{ stopColor: "rgb(var(--teal-400))" }} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <p className="font-display text-[1.875rem] font-extrabold text-sage-800">
          {percent}%
        </p>
        <p className="text-xs text-sage-500">paid</p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-wrap justify-between items-baseline gap-x-4 gap-y-1 px-4 py-3.5 border-b border-mint-100 last:border-b-0">
      <span className="text-sm text-sage-500">{label}</span>
      <span className="text-sm font-bold text-sage-800 text-right break-all">
        {value}
      </span>
    </div>
  );
}

export default function MobileDebtDetail({
  debt,
  payments,
  onLogPayment,
  onDelete,
  isDeleting,
}: {
  debt: Debt;
  payments: Payment[];
  onLogPayment: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const router = useRouter();
  const percent = percentPaid(debt.total_amount, debt.amount_owed);
  const arrangement = arrangementStyle(debt.arrangement);
  const year = new Date().getFullYear();
  const addedOn = new Date(debt.created_at);

  return (
    /* Bottom padding clears the pinned bar. */
    <div className="w-full max-w-full px-4 pt-2 pb-32 flex flex-col gap-4">
      <div className="flex gap-2">
        <button
          onClick={() => router.push(`/debts/${debt.id}/edit`)}
          className="flex items-center gap-1.5 px-3.5 min-h-[44px] rounded-pill border border-mint-200 text-sage-700 text-sm font-semibold active:bg-mint-100 transition-colors duration-fast"
        >
          <Pencil size={15} /> Edit
        </button>
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="flex items-center gap-1.5 px-3.5 min-h-[44px] rounded-pill border border-alert-200 bg-alert-100 text-alert-600 text-sm font-semibold disabled:opacity-50 transition-colors duration-fast"
        >
          <Trash2 size={15} /> {isDeleting ? "Deleting…" : "Delete"}
        </button>
      </div>

      {/* Hero */}
      <div className="flex flex-col items-center gap-3.5 pt-2">
        <h1 className="font-display text-2xl font-extrabold text-sage-800 text-center">
          {debt.company}
        </h1>
        <Ring percent={percent} />
        <p className="text-sm text-sage-500">
          {money(debt.total_amount - debt.amount_owed)} paid of{" "}
          {money(debt.total_amount)}
        </p>
        <p className="font-display text-[1.875rem] font-extrabold text-sage-800 -mt-2">
          {money(debt.amount_owed)} left
        </p>
        <span
          className={`flex items-center gap-2 px-3 py-1.5 rounded-pill border ${arrangement.chip}`}
        >
          <span className={`w-2 h-2 rounded-full ${arrangement.dot}`} />
          <span className="text-xs font-medium">{arrangement.label}</span>
        </span>
      </div>

      {/* Details */}
      <div className="bg-white border border-mint-200 rounded-xl overflow-hidden">
        <Row label="Original balance" value={money(debt.total_amount)} />
        <Row label="Still owed" value={money(debt.amount_owed)} />
        <Row
          label="Monthly amount"
          value={debt.monthly_amount ? money(debt.monthly_amount) : "—"}
        />
        <Row
          label="Direct debit"
          value={
            debt.direct_debit_date
              ? `${ordinal(debt.direct_debit_date)} of the month`
              : "—"
          }
        />
        <Row label="Reference" value={debt.account_reference || "—"} />
        <Row
          label="Contact"
          value={
            debt.company_email ? (
              <a href={`mailto:${debt.company_email}`} className="text-brand">
                {debt.company_email}
              </a>
            ) : (
              "—"
            )
          }
        />
        <Row label="Cleared by" value={formatMonthYear(clearedDate(debt), "long")} />
      </div>

      {/* This year */}
      <div>
        <p className="caps-label px-1 mb-2">{year} payments</p>
        <div className="bg-white border border-mint-200 rounded-xl p-4">
          <div className="grid grid-cols-6 gap-2">
            {MONTHS.map((month, idx) => {
              const status: MonthStatus = getDebtStripMonthStatus(
                debt,
                payments,
                idx,
                year,
                startOfMonth(addedOn),
              );
              const before = status === "before-signup";
              return (
                <div key={month} className="flex flex-col items-center gap-1">
                  <span className="text-2xs font-bold tracking-caps uppercase text-sage-400">
                    {month}
                  </span>
                  <MonthCell
                    status={status}
                    label={`${month}, ${debt.company}`}
                    size={38}
                    onClick={
                      !before && status !== "future"
                        ? () => router.push(`/tracker/${idx + 1}`)
                        : undefined
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="px-1">
        <ProgressBar
          percent={percent}
          height={8}
          label={`${percent}% of ${debt.company} paid`}
        />
      </div>

      {/* Pinned action. Deliberately breaks the design system's "nothing
          follows you down the page" rule: on a phone this is the reason
          people open this screen, and it scrolls long. */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-mint-200 px-4 pt-3.5 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden">
        <button
          onClick={onLogPayment}
          className="w-full flex items-center justify-center gap-2 min-h-[56px] rounded-pill bg-brand text-white text-base font-semibold active:bg-brand-hover transition-colors duration-base"
        >
          <Plus size={20} /> Log payment
        </button>
      </div>
    </div>
  );
}
