"use client";

import { Plus, CheckCircle, Check, Minus } from "lucide-react";
import type { Debt } from "@/lib/types";
import { paymentTypeStyle, formatDayMonth } from "@/lib/paymentType";
import { CategoryTile, money } from "@/components/mobile/ui";

export type MonthPayment = {
  id: string;
  amount: number;
  payment_date: string;
  payment_type: string;
};

export type MonthNote = {
  id: string;
  reason: string;
  actions: string | null;
  due_date: string | null;
};

export type MonthDetails = Record<
  string,
  { payments: MonthPayment[]; notes: MonthNote[] }
>;

/** paid / partial / missed, from what's actually been logged this month. */
function statusOf(debt: Debt, payments: MonthPayment[]) {
  if (payments.length === 0) return "missed" as const;
  const total = payments.reduce((sum, p) => sum + p.amount, 0);
  if (debt.monthly_amount && total < debt.monthly_amount) return "partial" as const;
  return "paid" as const;
}

const STATUS_CHIP = {
  paid: "bg-ok-100 border-ok-200 text-ok-700",
  partial: "bg-warn-100 border-warn-200 text-warn-700",
  missed: "bg-mint-100 border-mint-200 text-sage-600",
} as const;

const STATUS_WORD = {
  paid: "Paid",
  partial: "Part paid",
  missed: "Nothing logged yet",
} as const;

export default function MobileMonth({
  monthName,
  year,
  debts,
  details,
  onLogPayment,
}: {
  monthName: string;
  year: number;
  debts: Debt[];
  details: MonthDetails;
  onLogPayment: (debt: Debt) => void;
}) {
  const allGood =
    debts.length > 0 &&
    debts.every(
      (d) => statusOf(d, details[d.id]?.payments ?? []) === "paid",
    );

  return (
    <div className="w-full max-w-full p-4 pb-10 flex flex-col gap-4">
      {/* The app bar carries the back arrow, so the page owns the title. */}
      <header>
        <h1 className="font-display text-[1.75rem] leading-tight font-extrabold text-sage-800">
          {monthName} {year}
        </h1>
        <p className="text-sm text-sage-500 mt-1">
          The full picture for this month
        </p>
      </header>

      {allGood && (
        <div className="bg-ok-100 border border-ok-200 rounded-2xl px-5 py-6 text-center">
          <span
            className="flex items-center justify-center w-14 h-14 mx-auto mb-3 rounded-pill border border-ok-200 text-ok-600"
            aria-hidden="true"
          >
            <CheckCircle size={30} />
          </span>
          <p className="font-display text-lg font-extrabold text-ok-700">
            Nothing missed
          </p>
          <p className="text-sm text-ok-600 mt-1">
            Everything for this month is logged. Seriously, great work.
          </p>
        </div>
      )}

      {debts.length === 0 && (
        <p className="py-8 text-center text-sage-500">
          No debts to show for this month.
        </p>
      )}

      {debts.map((debt) => {
        const detail = details[debt.id] ?? { payments: [], notes: [] };
        const status = statusOf(debt, detail.payments);

        return (
          <article
            key={debt.id}
            className="bg-white border border-mint-200 rounded-xl shadow-sm p-4"
          >
            <div className="flex items-center gap-3">
              <CategoryTile category={debt.category} />
              <div className="flex-1 min-w-0">
                <p className="font-display text-[1.125rem] font-bold text-sage-800 truncate">
                  {debt.company}
                </p>
                <p className="text-xs text-sage-500">
                  {debt.monthly_amount
                    ? `${money(debt.monthly_amount)}/month agreed`
                    : "No monthly amount set"}
                </p>
              </div>
              <span
                className={`flex items-center justify-center w-9 h-9 shrink-0 rounded-lg border ${STATUS_CHIP[status]}`}
                aria-hidden="true"
              >
                {status === "paid" && <Check size={16} />}
                {status === "partial" && <Minus size={16} />}
                {status === "missed" && <span className="text-sm">—</span>}
              </span>
              <span className="sr-only">{STATUS_WORD[status]}</span>
            </div>

            {detail.payments.length > 0 ? (
              <ul className="flex flex-col gap-2 mt-3.5">
                {detail.payments.map((payment) => {
                  const style = paymentTypeStyle(payment.payment_type);
                  const Icon = style.Icon;
                  return (
                    <li
                      key={payment.id}
                      className="flex items-center gap-3 bg-mint-50 rounded-lg px-3 py-2.5"
                    >
                      <Icon size={16} className={`${style.color} shrink-0`} />
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-semibold text-sage-800">
                          {money(payment.amount)}
                        </span>
                        <span className="block text-xs text-sage-500">
                          {formatDayMonth(payment.payment_date)}
                        </span>
                      </span>
                      <span
                        className={`text-xs font-semibold text-right ${style.color}`}
                      >
                        {style.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-sage-500 mt-3.5">
                Nothing logged for this month yet.
              </p>
            )}

            {detail.notes.length > 0 && (
              <ul className="flex flex-col gap-2 mt-3 pt-3 border-t border-mint-100">
                {detail.notes.map((note) => (
                  <li key={note.id} className="bg-peach-100/50 rounded-lg p-3">
                    <p className="caps-label">Note</p>
                    <p className="text-sm text-sage-700 mt-1">{note.reason}</p>
                    {note.actions && (
                      <p className="text-xs text-sage-500 mt-1">
                        &rarr; {note.actions}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}

            <button
              onClick={() => onLogPayment(debt)}
              className="w-full flex items-center justify-center gap-2 min-h-[48px] mt-3.5 rounded-pill bg-brand text-white text-sm font-semibold active:bg-brand-hover transition-colors duration-base"
            >
              <Plus size={18} /> Log a payment
            </button>
          </article>
        );
      })}
    </div>
  );
}
