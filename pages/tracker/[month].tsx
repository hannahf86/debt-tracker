"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { useTracker, getDebtMonthStatus } from "@/lib/hooks/useTracker";
import type { Debt } from "@/lib/types";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const arrangementConfig = {
  "needs-setting-up": {
    label: "Needs setting up",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    icon: "🔵",
  },
  "awaiting-response": {
    label: "Awaiting response",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    icon: "🟠",
  },
  "payment-plan": {
    label: "Payment plan in place",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    icon: "✅",
  },
  "account-in-default": {
    label: "Account in default",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    icon: "🚨",
  },
};

export default function MonthTrackerPage() {
  const router = useRouter();
  const { month } = router.query;
  const monthIndex = parseInt(month as string) - 1;
  const year = new Date().getFullYear();
  const { data, isLoading } = useTracker();

  const [currentDebtIndex, setCurrentDebtIndex] = useState(0);
  const [form, setForm] = useState({ due_date: "", reason: "" });
  const [hasEmailed, setHasEmailed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  const missedDebts = data.debts.filter(
    (debt) =>
      getDebtMonthStatus(debt, data.payments, monthIndex, year) === "missed" &&
      !submitted.includes(debt.id),
  );

  const currentDebt = missedDebts[currentDebtIndex];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDebt) return;
    setIsSubmitting(true);

    try {
      // Log the missed payment note
      await fetch("/api/tracker/missed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          debt_id: currentDebt.id,
          month: monthIndex + 1,
          year,
          due_date: form.due_date || null,
          reason: form.reason,
        }),
      });

      // Update arrangement based on whether they've emailed
      const newArrangement = hasEmailed
        ? "awaiting-response"
        : "needs-setting-up";
      await fetch(`/api/debts/${currentDebt.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ arrangement: newArrangement }),
      });

      setSubmitted([...submitted, currentDebt.id]);
      setForm({ due_date: "", reason: "" });
      setHasEmailed(false);

      if (currentDebtIndex < missedDebts.length - 1) {
        setCurrentDebtIndex(currentDebtIndex + 1);
      } else {
        setSuccess(true);
      }
    } catch (error) {
      console.error("Error submitting:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6">
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => router.push("/tracker")}
          className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-sm font-medium mb-8"
        >
          ← Back to tracker
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {monthNames[monthIndex]} {year}
          </h1>
          <p className="text-slate-400 text-sm">
            {missedDebts.length + submitted.length === 0
              ? "All payments were logged this month 🎉"
              : `${missedDebts.length} payment${missedDebts.length !== 1 ? "s" : ""} to review`}
          </p>
        </div>

        {success ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4">✓</div>
            <h2 className="text-xl font-bold text-white mb-2">All caught up</h2>
            <p className="text-slate-400 text-sm mb-6">
              Good on you for facing it head on. That's the hardest part done.
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium px-6 py-2 rounded-lg hover:from-purple-500 hover:to-indigo-500 transition-all"
            >
              Back to dashboard
            </button>
          </div>
        ) : missedDebts.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-xl font-bold text-white mb-2">
              Nothing missed!
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              All payments were logged this month.
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium px-6 py-2 rounded-lg hover:from-purple-500 hover:to-indigo-500 transition-all"
            >
              Back to dashboard
            </button>
          </div>
        ) : (
          currentDebt && (
            <>
              {/* Progress indicator */}
              {missedDebts.length + submitted.length > 1 && (
                <div className="flex gap-2 mb-6">
                  {[
                    ...submitted.map(() => true),
                    ...missedDebts.map(() => false),
                  ].map((done, idx) => (
                    <div
                      key={idx}
                      className={`h-1 flex-1 rounded-full ${done ? "bg-purple-500" : "bg-slate-700"}`}
                    />
                  ))}
                </div>
              )}

              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                {/* Debt header */}
                <div className="flex items-start justify-between mb-6 pb-6 border-b border-slate-800">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">
                      Missed payment
                    </p>
                    <h2 className="text-xl font-bold text-white">
                      {currentDebt.company}
                    </h2>
                    <p className="text-slate-400 text-sm">
                      £{currentDebt.monthly_amount}/month
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                    ✕
                  </div>
                </div>

                {/* Current arrangement */}
                {currentDebt.arrangement && (
                  <div
                    className={`mb-6 p-3 rounded-xl ${arrangementConfig[currentDebt.arrangement].bg} border ${arrangementConfig[currentDebt.arrangement].border} flex items-center gap-2`}
                  >
                    <span>
                      {arrangementConfig[currentDebt.arrangement].icon}
                    </span>
                    <span
                      className={`text-sm font-medium ${arrangementConfig[currentDebt.arrangement].color}`}
                    >
                      {arrangementConfig[currentDebt.arrangement].label}
                    </span>
                  </div>
                )}

                {/* Company contact */}
                <div className="mb-6 p-4 bg-slate-800/50 rounded-xl">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-3">
                    Contact
                  </p>
                  <p className="text-white text-sm font-medium mb-1">
                    {currentDebt.company}
                  </p>
                  {currentDebt.company_email ? (
                    <a
                      href={`mailto:${currentDebt.company_email}`}
                      className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
                    >
                      {currentDebt.company_email}
                    </a>
                  ) : (
                    <p className="text-slate-500 text-sm">
                      No email address saved
                    </p>
                  )}
                  <p className="text-slate-400 text-xs mt-3">
                    💡 Email them to explain what happened and ask about your
                    options
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-2">
                      Date it was due
                    </label>
                    <input
                      type="date"
                      value={form.due_date}
                      onChange={(e) =>
                        setForm({ ...form, due_date: e.target.value })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-2">
                      What happened?
                    </label>
                    <textarea
                      value={form.reason}
                      onChange={(e) =>
                        setForm({ ...form, reason: e.target.value })
                      }
                      placeholder="No judgment here — just helps to write it down..."
                      rows={3}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none"
                      required
                    />
                  </div>

                  {/* Emailed checkbox */}
                  <label
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      hasEmailed
                        ? "bg-amber-500/10 border-amber-500/30"
                        : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={hasEmailed}
                      onChange={(e) => setHasEmailed(e.target.checked)}
                      className="mt-0.5 accent-amber-500"
                    />
                    <div>
                      <p
                        className={`text-sm font-medium ${hasEmailed ? "text-amber-300" : "text-slate-300"}`}
                      >
                        I've emailed the contact
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Arrangement will update to "Awaiting response"
                      </p>
                    </div>
                  </label>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 rounded-xl hover:from-purple-500 hover:to-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting
                      ? "Saving..."
                      : missedDebts.length > 1
                        ? "Save & next →"
                        : "Save"}
                  </button>
                </form>
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
}
