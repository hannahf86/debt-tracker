"use client";

import { ordinal } from "@/lib/format";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useDebts } from "@/lib/hooks/useDebts";
import { ChevronDown, Plus, CreditCard, Landmark, Zap, Receipt, Home, MoreHorizontal, Check, Minus, MapPin } from "lucide-react";
import type { Debt } from "@/lib/types";
import { arrangementStyle } from "@/lib/arrangement";
import {
  useTracker,
  allDebtsMonthStatus,
  missedMonthCount,
} from "@/lib/hooks/useTracker";
import { useProfile } from "@/lib/hooks/useProfile";
import {
  projectDebtFree,
  formatLongDate,
  budgetUsage,
} from "@/lib/projection";
import LogPaymentModal from "@/components/LogPaymentModal";
import DueChip from "@/components/DueChip";
import MobileDashboard from "@/components/mobile/MobileDashboard";

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

function timeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Morning";
  if (h < 18) return "Afternoon";
  return "Evening";
}

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
  const { debts, isLoading, error: debtsError, updateDebt } = useDebts();
  const {
    data: trackerData,
    isLoading: isTrackerLoading,
    fetchTracker,
  } = useTracker();
  const { profile, greetingName } = useProfile();
  const budget = profile.monthly_budget;
  const [logPaymentDebt, setLogPaymentDebt] = useState<Debt | null>(null);
  const [pickingDebt, setPickingDebt] = useState(false);

  useEffect(() => {
    // Only send someone to onboarding when we know they genuinely have no
    // debts. A failed fetch also yields an empty list, and redirecting on that
    // traps them in a loop they can't leave.
    if (!isLoading && !debtsError && debts.length === 0) {
      router.push("/onboarding");
    }
  }, [isLoading, debtsError, debts, router]);

  if (status === "unauthenticated") {
    router.push("/auth/login");
    return null;
  }

  const projection = projectDebtFree(debts);
  const usage = budgetUsage(debts, budget);
  const totalDebt = projection.totalOwed;

  // Prefer what they've asked to be called; fall back to the email local part.
  const fallback = (session?.user?.email || "").split("@")[0].split(/[.\s_-]/)[0];
  const raw = greetingName || fallback;
  const displayName = raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : "";

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

  return (
    <>
      <div className="md:hidden">
        <MobileDashboard
          debts={debts}
          projection={projection}
          budget={budget}
          trackerData={trackerData}
          isLoading={isLoading}
          onLogPayment={setLogPaymentDebt}
          displayName={displayName}
        />
      </div>

      <div className="hidden md:block p-4 md:p-6">
      {/* Header + debt free day */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          {/* Greeting depends on the client clock, so it can't match a
              prerendered value — compute it here and skip the mismatch check. */}
          <h1
            className="text-3xl md:text-4xl font-bold text-sage-800 mb-2"
            suppressHydrationWarning
          >
            {timeGreeting()}
            {displayName ? `, ${displayName}` : ""}
          </h1>
          <p className="text-sage-600">
            Let&rsquo;s get you debt free and find some peace
          </p>
        </div>

        <div className="bg-white border border-mint-200 rounded-2xl p-6 shadow-sm w-full md:w-[22rem] shrink-0 text-center">
          <p className="text-sage-600 text-sm mb-1">Your debt free day</p>
          <p className="font-display text-3xl font-bold text-sage-800 mb-1">
            {isLoading ? "—" : formatLongDate(projection.date)}
          </p>
          <p className="text-2xs text-sage-500 mb-4">
            {projection.unprojectable.length > 0
              ? `Add a monthly amount to ${projection.unprojectable.length} ${
                  projection.unprojectable.length === 1 ? "debt" : "debts"
                } to see this`
              : "Based on your current pay schedule"}
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2.5 bg-teal-100 rounded-pill overflow-hidden">
              <div
                className="progress-bar h-full rounded-pill"
                style={{ width: `${projection.percentCleared}%` }}
              />
            </div>
            <span className="text-sm font-bold text-brand tabular-nums">
              {projection.percentCleared}%
            </span>
          </div>
        </div>
      </div>

      {/* Monthly Tracker */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-white border border-mint-200 rounded-2xl p-4 sm:p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
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

          <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 sm:gap-3">
            {months.map((month, idx) => {
              const monthStatus = isTrackerLoading
                ? "future"
                : allDebtsMonthStatus(
                    trackerData.debts,
                    trackerData.payments,
                    idx,
                    new Date().getFullYear(),
                    "before-signup",
                  );

              return (
                <div key={month} className="flex flex-col items-center gap-2 min-w-0">
                  <div
                    className={`text-xs font-medium ${idx === new Date().getMonth() ? "text-now-600" : "text-sage-500"}`}
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
                    className={`w-full aspect-square max-w-12 rounded-lg border flex items-center justify-center transition-all focus:outline-none hover:-translate-y-0.5 hover:shadow-md ${
                      monthStatus === "before-signup"
                        ? "bg-peach-100/30 border-peach-200/50 text-peach-300 cursor-default"
                        : monthStatus === "current"
                          ? "bg-now-100 border-now-200 text-now-600 cursor-pointer hover:bg-now-200 shadow-sm"
                          : monthStatus === "paid"
                            ? "bg-ok-100 border-ok-200 text-ok-600 cursor-pointer hover:bg-ok-200 shadow-sm"
                            : monthStatus === "partial"
                              ? "bg-warn-100 border-warn-200 text-warn-600 cursor-pointer hover:bg-warn-200 shadow-sm"
                              : monthStatus === "missed"
                                ? "bg-warn-100 border-warn-200 text-warn-600 cursor-pointer hover:bg-warn-200 shadow-sm"
                                : monthStatus === "future"
                                  ? "bg-white/40 border-mint-200 text-sage-500 cursor-default"
                                  : "bg-peach-100/50 border-peach-200 text-peach-300 cursor-default"
                    }`}
                  >
                    {monthStatus === "paid" && (
                      <Check size={16} />
                    )}
                    {monthStatus === "missed" && (
                      <span className="text-base font-bold">?</span>
                    )}
                    {monthStatus === "partial" && (
                      <Minus size={16} />
                    )}
                    {monthStatus === "current" && (
                      <MapPin size={16} />
                    )}
                    {(monthStatus === "before-signup" ||
                      monthStatus === "future") && (
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
      <div className="max-w-6xl mx-auto mb-8 flex flex-col lg:flex-row lg:items-stretch gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
          <div className="bg-white border border-mint-200 rounded-xl p-6 shadow-sm">
            <p className="caps-label mb-3">Total debt</p>
            <p className="font-display text-3xl font-bold text-sage-800">
              £{Math.round(totalDebt).toLocaleString()}
            </p>
            <p className="text-xs text-sage-500 mt-2">
              of £{Math.round(projection.totalOriginal).toLocaleString()}{" "}
              originally
            </p>
          </div>

          <div className="bg-white border border-mint-200 rounded-xl p-6 shadow-sm">
            <p className="caps-label mb-3">Monthly budget</p>
            <p className="font-display text-3xl font-bold text-sage-800">
              {budget === null ? "—" : `£${Math.round(budget).toLocaleString()}`}
            </p>
            {budget === null ? (
              <p className="text-xs text-sage-500 mt-2">
                <button
                  onClick={() => router.push("/settings")}
                  className="underline hover:text-sage-800 transition-colors"
                >
                  Set one in settings
                </button>
              </p>
            ) : (
              <>
                <div className="w-full h-1.5 bg-mint-100 rounded-pill overflow-hidden mt-3">
                  <div
                    className={`h-full rounded-pill ${usage.over ? "bg-warn-600" : "bg-ok-600"}`}
                    style={{ width: `${usage.percent ?? 0}%` }}
                  />
                </div>
                <p
                  className={`text-xs mt-2 font-semibold ${
                    usage.over ? "text-warn-600" : "text-ok-600"
                  }`}
                >
                  £{Math.round(usage.committed).toLocaleString()} of £
                  {Math.round(budget).toLocaleString()} committed
                  {usage.over ? " — over budget" : ""}
                </p>
              </>
            )}
          </div>

          <div className="bg-white border border-mint-200 rounded-xl p-6 shadow-sm">
            <p className="caps-label mb-3">
              Debt cleared <span className="normal-case">so far</span>
            </p>
            <p className="font-display text-3xl font-bold text-sage-800">
              £{Math.round(trackerData.totalPaid).toLocaleString()}
            </p>
            <p className="text-xs text-sage-500 mt-2">
              {trackerData.totalPaid > 0
                ? "Amazing work — keep going"
                : "Every bit counts"}
            </p>
          </div>
        </div>

        <div className="flex flex-row lg:flex-col gap-3 lg:justify-center shrink-0">
          <button
            onClick={() => setPickingDebt(true)}
            disabled={debts.length === 0}
            className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-5 min-h-[48px] bg-brand hover:bg-brand-hover disabled:opacity-50 text-white rounded-pill text-sm font-semibold transition-colors duration-base"
          >
            <Plus size={16} /> Add payment
          </button>
          <button
            onClick={() => router.push("/debts/new")}
            className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-5 min-h-[48px] bg-brand hover:bg-brand-hover text-white rounded-pill text-sm font-semibold transition-colors duration-base"
          >
            <Plus size={16} /> A new debt
          </button>
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
            <p className="text-sage-500 text-sm">
              Add your first debt to get started
            </p>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {debts.map((debt) => (
              <div
                key={debt.id}
                className="debt-card bg-white border border-mint-200 rounded-xl p-6 cursor-pointer group shadow-sm hover:shadow-md"
                onClick={() => router.push(`/debts/${debt.id}`)}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="shrink-0">{categoryIcon(debt.category)}</div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sage-800 text-base truncate">
                        {debt.company}
                      </h3>
                    </div>
                    <DueChip dayOfMonth={debt.direct_debit_date} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  {(() => {
                    // Same amber and question mark as the tracker's cells, so
                    // the pill reads as a shorthand for what the grid shows.
                    const missed = missedMonthCount(debt, trackerData.payments);
                    if (missed === 0) return null;
                    return (
                      <span className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-pill border bg-warn-100 border-warn-200 text-warn-600">
                        <span aria-hidden="true" className="text-xs font-bold">
                          ?
                        </span>
                        <span className="text-xs font-medium whitespace-nowrap">
                          {missed} month{missed === 1 ? "" : "s"} with nothing
                          logged
                        </span>
                      </span>
                    );
                  })()}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleArrangement(debt);
                    }}
                    className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-pill border hover:opacity-90 transition-all ${arrangementStyle(debt.arrangement).chip}`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${arrangementStyle(debt.arrangement).dot}`}
                    />
                    <span className="text-xs font-medium whitespace-nowrap">
                      {arrangementStyle(debt.arrangement).label}
                    </span>
                  </button>
                  </div>
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
                  <div className="w-full h-2 bg-mint-100 rounded-pill overflow-hidden mb-3">
                    <div
                      className="progress-bar h-full rounded-pill"
                      style={{ width: `${getProgressPercent(debt)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-sage-500 opacity-0 group-hover:opacity-100 transition-opacity">
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
          className="w-full border-2 border-dashed border-sage-300 rounded-xl p-6 text-sage-500 hover:text-sage-600 hover:border-sage-400 transition-all group flex items-center justify-center gap-2"
        >
          <Plus
            size={20}
            className="group-hover:text-sage-600 transition-colors"
          />
          <span className="font-medium">Add a debt</span>
        </button>
      </div>
      </div>

      {/* "Add payment" needs a debt first — the modal itself takes exactly one. */}
      {pickingDebt && (
        <div
          className="fixed inset-0 bg-sage-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setPickingDebt(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-modal w-full max-w-sm max-h-[calc(100dvh-2rem)] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-xl font-bold text-sage-800 mb-1">
              Which debt?
            </h2>
            <p className="text-sm text-sage-600 mb-5">
              Pick the one you&rsquo;ve paid.
            </p>
            <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
              {debts.map((debt) => (
                <button
                  key={debt.id}
                  onClick={() => {
                    setPickingDebt(false);
                    setLogPaymentDebt(debt);
                  }}
                  className="w-full flex items-center gap-3 text-left px-4 min-h-[48px] py-3 rounded-xl border border-mint-200 hover:border-brand hover:bg-teal-50 transition-colors duration-base"
                >
                  <span className="text-brand shrink-0">
                    {categoryIcon(debt.category)}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-medium text-sage-800 truncate">
                      {debt.company}
                    </span>
                    <span className="block text-xs text-sage-500">
                      £{Math.round(debt.amount_owed).toLocaleString()} remaining
                    </span>
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setPickingDebt(false)}
              className="w-full mt-5 min-h-[48px] rounded-pill border border-mint-200 text-sage-700 text-sm font-semibold hover:bg-paper-sunk transition-colors duration-base"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Log Payment Modal */}
      {logPaymentDebt && (
        <LogPaymentModal
          debt={logPaymentDebt}
          onClose={() => setLogPaymentDebt(null)}
          onSuccess={(newAmountOwed) => {
            updateDebt(logPaymentDebt.id, { amount_owed: newAmountOwed });
            // updateDebt only refreshes the balance; the tracker strip reads
            // payments, which need fetching again.
            fetchTracker();
            setTimeout(() => setLogPaymentDebt(null), 2500);
          }}
        />
      )}
    </>
  );
}
