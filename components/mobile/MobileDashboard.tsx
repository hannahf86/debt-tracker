"use client";

import { useRouter } from "next/router";
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
import type { DebtFreeProjection } from "@/lib/projection";
import { formatLongDate, budgetUsage } from "@/lib/projection";
import { ordinal } from "@/lib/format";
import {
  allDebtsMonthStatus,
  type TrackerData,
  type MonthStatus,
} from "@/lib/hooks/useTracker";
import MonthCell from "@/components/mobile/MonthCell";

const MONTHS = [
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

const CATEGORY_ICON: Record<string, typeof CreditCard> = {
  "credit-card": CreditCard,
  loan: Landmark,
  utilities: Zap,
  tax: Receipt,
  household: Home,
  other: MoreHorizontal,
};

function CategoryTile({
  category,
  size = 40,
}: {
  category: string;
  size?: number;
}) {
  const Icon = CATEGORY_ICON[category] ?? MoreHorizontal;
  return (
    <span
      className="flex items-center justify-center rounded-md bg-teal-50 text-brand shrink-0"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Icon size={Math.round(size * 0.5)} />
    </span>
  );
}

function ProgressBar({
  percent,
  height = 8,
  label,
}: {
  percent: number;
  height?: number;
  label: string;
}) {
  return (
    <div
      className="w-full bg-teal-100 rounded-pill overflow-hidden"
      style={{ height }}
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className="progress-bar h-full rounded-pill"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

function timeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Morning";
  if (h < 18) return "Afternoon";
  return "Evening";
}

export default function MobileDashboard({
  debts,
  projection,
  budget,
  trackerData,
  isLoading,
  onLogPayment,
  displayName,
}: {
  debts: Debt[];
  projection: DebtFreeProjection;
  budget: number | null;
  trackerData: TrackerData;
  isLoading: boolean;
  onLogPayment: (debt: Debt) => void;
  displayName: string;
}) {
  const router = useRouter();
  const greeting = timeGreeting();
  const usage = budgetUsage(debts, budget);

  const year = new Date().getFullYear();
  const thisMonth = new Date().getMonth();

  const percentOf = (d: Debt) =>
    d.total_amount > 0
      ? Math.round(((d.total_amount - d.amount_owed) / d.total_amount) * 100)
      : 0;

  // What's due this month, and how much of it is still unlogged.
  const dueThisMonth = debts.reduce(
    (sum, d) => sum + (d.monthly_amount ?? 0),
    0,
  );
  const stillToLog = debts.filter((d) => {
    const key = `${year}-${String(thisMonth + 1).padStart(2, "0")}`;
    return !trackerData.payments.some(
      (p) => p.debt_id === d.id && p.payment_date.startsWith(key),
    );
  }).length;

  return (
    <div className="w-full p-4 pb-10 flex flex-col gap-4">
      {/* Greeting — the app bar leaves its title blank so this is the heading.
          Depends on the client clock, so skip the hydration match. */}
      <header className="pt-1 pb-1">
        <h1
          className="font-display text-[1.75rem] leading-tight font-extrabold text-sage-800"
          suppressHydrationWarning
        >
          {greeting}
          {displayName ? `, ${displayName}` : ""}
        </h1>
        <p className="text-sage-600 mt-1">
          Let&rsquo;s get you debt free and find some peace
        </p>
      </header>

      {/* a. Debt free day — the motivating figure goes first */}
      <section className="bg-white border border-mint-200 rounded-2xl shadow-sm px-5 py-6 text-center">
        <p className="text-sm text-sage-500">Your debt free day</p>
        <p className="font-display text-[2.25rem] leading-tight font-extrabold text-sage-800 my-1.5">
          {isLoading ? "—" : formatLongDate(projection.date)}
        </p>
        <p className="text-xs text-sage-500 mb-4">
          {projection.unprojectable.length > 0
            ? `Add a monthly amount to ${projection.unprojectable.length} ${
                projection.unprojectable.length === 1 ? "debt" : "debts"
              } to see this`
            : "Based on your current pay schedule"}
        </p>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <ProgressBar
              percent={projection.percentCleared}
              height={10}
              label={`${projection.percentCleared}% of your total debt cleared`}
            />
          </div>
          <span className="font-display text-base font-extrabold text-brand tabular-nums">
            {projection.percentCleared}%
          </span>
        </div>
      </section>

      {/* b. Total debt */}
      <section className="bg-white border border-mint-200 rounded-2xl shadow-sm px-5 py-6">
        <p className="caps-label">Total debt</p>
        <p className="font-display text-[2.75rem] leading-none font-extrabold text-sage-800 mt-2.5 mb-1">
          £{Math.round(projection.totalOwed).toLocaleString()}
        </p>
        <p className="text-sm text-sage-500 mb-4">
          £{Math.round(projection.totalCleared).toLocaleString()} paid of £
          {Math.round(projection.totalOriginal).toLocaleString()}
        </p>
        <ProgressBar
          percent={projection.percentCleared}
          height={10}
          label={`${projection.percentCleared}% of your total debt cleared`}
        />
        <div className="flex justify-between mt-2.5 text-xs text-sage-500">
          <span>{projection.percentCleared}% cleared</span>
          <span>
            {debts.length} {debts.length === 1 ? "debt" : "debts"} open
          </span>
        </div>
      </section>

      {/* c. Two stat tiles */}
      <div className="flex gap-3">
        <div className="flex-1 bg-white border border-mint-200 rounded-xl px-3.5 py-4">
          <p className="caps-label">Monthly budget</p>
          <p className="font-display text-[1.625rem] font-extrabold text-sage-800 mt-2">
            {budget === null ? "—" : `£${Math.round(budget).toLocaleString()}`}
          </p>
          {usage.percent === null ? (
            <p className="text-xs text-sage-500 mt-0.5">for debt repayment</p>
          ) : (
            <>
              <div className="w-full h-1.5 bg-mint-100 rounded-pill overflow-hidden mt-2">
                <div
                  className={`h-full rounded-pill ${usage.over ? "bg-warn-600" : "bg-ok-600"}`}
                  style={{ width: `${usage.percent}%` }}
                />
              </div>
              <p
                className={`text-xs mt-1.5 font-semibold ${
                  usage.over ? "text-warn-600" : "text-ok-600"
                }`}
              >
                £{Math.round(usage.committed).toLocaleString()} committed
                {usage.over ? " — over" : ""}
              </p>
            </>
          )}
        </div>
        <div className="flex-1 bg-white border border-mint-200 rounded-xl px-3.5 py-4">
          <p className="caps-label">Due this month</p>
          <p className="font-display text-[1.625rem] font-extrabold text-sage-800 mt-2">
            {dueThisMonth > 0
              ? `£${Math.round(dueThisMonth).toLocaleString()}`
              : "—"}
          </p>
          <p className="text-xs text-sage-500 mt-0.5">
            {stillToLog} of {debts.length} still to log
          </p>
        </div>
      </div>

      {/* d. Year strip — scrolls sideways rather than wrapping */}
      <section className="bg-white border border-mint-200 rounded-xl pt-4 pb-4">
        <div className="flex items-center justify-between px-4 pb-3.5">
          <p className="caps-label">{year} payment history</p>
          <button
            onClick={() => router.push("/tracker")}
            className="text-xs font-bold text-brand hover:text-brand-hover transition-colors duration-base"
          >
            Tracker →
          </button>
        </div>
        <div className="flex gap-2 px-4 pb-1 overflow-x-auto no-scrollbar">
          {MONTHS.map((month, idx) => {
            const status: MonthStatus = isLoading
              ? "future"
              : allDebtsMonthStatus(
                  trackerData.debts,
                  trackerData.payments,
                  idx,
                  year,
                );

            return (
              <div
                key={month}
                className="flex flex-col items-center gap-1.5 shrink-0"
              >
                <span className="text-2xs font-bold tracking-caps uppercase text-sage-400">
                  {month}
                </span>
                <MonthCell
                  status={status}
                  label={month}
                  size={46}
                  onClick={
                    status !== "future"
                      ? () => router.push(`/tracker/${idx + 1}`)
                      : undefined
                  }
                />
              </div>
            );
          })}
        </div>
      </section>

      {/* e. Section header */}
      <div className="flex items-baseline justify-between px-1 pt-1.5">
        <p className="caps-label">Your debts</p>
        <span className="text-xs text-sage-400">{debts.length} open</span>
      </div>

      {/* f. Debt rows */}
      {isLoading ? (
        <p className="text-center py-8 text-sage-500">Loading your debts...</p>
      ) : (
        debts.map((debt) => {
          const percent = percentOf(debt);
          return (
            <article
              key={debt.id}
              className="bg-white border border-mint-200 rounded-xl shadow-sm p-4"
            >
              <div className="flex items-start gap-3">
                <CategoryTile category={debt.category} />
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => router.push(`/debts/${debt.id}`)}
                    className="font-display text-[1.125rem] font-bold text-sage-800 text-left truncate w-full"
                  >
                    {debt.company}
                  </button>
                  <p className="text-xs text-sage-500 mt-0.5">
                    {debt.direct_debit_date
                      ? `Direct debit on the ${ordinal(debt.direct_debit_date)}`
                      : "No payment date set"}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display text-[1.125rem] font-extrabold text-sage-800">
                    £{Math.round(debt.amount_owed).toLocaleString()}
                  </p>
                  <p className="text-2xs text-sage-500">left</p>
                </div>
              </div>

              <div className="mt-3.5 mb-2.5">
                <ProgressBar
                  percent={percent}
                  height={8}
                  label={`${percent}% of ${debt.company} paid`}
                />
              </div>

              <div className="flex items-center justify-between gap-2.5">
                <span className="text-xs text-sage-500">{percent}% paid</span>
                <button
                  onClick={() => onLogPayment(debt)}
                  className="inline-flex items-center gap-1.5 px-3.5 min-h-[40px] rounded-pill border border-mint-200 text-sage-700 hover:bg-mint-100 text-xs font-semibold transition-colors duration-base"
                >
                  <Plus size={14} /> Log payment
                </button>
              </div>
            </article>
          );
        })
      )}

      {/* g. Add a debt */}
      <button
        onClick={() => router.push("/debts/new")}
        className="w-full flex items-center justify-center gap-2 min-h-[56px] rounded-xl border-2 border-dashed border-mint-300 text-sage-600 hover:text-brand hover:border-brand transition-colors duration-base text-sm font-semibold"
      >
        <Plus size={18} /> Add a debt
      </button>

      {/* h. Encouragement */}
      {projection.totalCleared > 0 && (
        <div className="flex gap-3 bg-ok-100 border border-ok-200 rounded-xl px-4 py-3.5">
          <p className="text-sm text-ok-700">
            Half-finished is still progress. You&rsquo;ve cleared £
            {Math.round(projection.totalCleared).toLocaleString()} so far.
          </p>
        </div>
      )}
    </div>
  );
}
