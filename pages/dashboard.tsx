"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useDebts } from "@/lib/hooks/useDebts";
import { ChevronDown, X, Plus, LogOut } from "lucide-react";
import type { Debt } from "@/lib/types";

const statusConfig = {
  "on-track": {
    label: "On track",
    bgColor: "bg-emerald-500/20",
    textColor: "text-emerald-300",
    borderColor: "border-emerald-500/30",
  },
  "payment-plan": {
    label: "Payment plan",
    bgColor: "bg-blue-500/20",
    textColor: "text-blue-300",
    borderColor: "border-blue-500/30",
  },
  "awaiting-response": {
    label: "Awaiting response",
    bgColor: "bg-amber-500/20",
    textColor: "text-amber-300",
    borderColor: "border-amber-500/30",
  },
  overdue: {
    label: "Overdue",
    bgColor: "bg-red-500/20",
    textColor: "text-red-300",
    borderColor: "border-red-500/30",
  },
  resolved: {
    label: "Resolved",
    bgColor: "bg-slate-500/20",
    textColor: "text-slate-300",
    borderColor: "border-slate-500/30",
  },
};

const categoryIcons: Record<string, string> = {
  "credit-card": "💳",
  loan: "📋",
  utilities: "⚡",
  tax: "📊",
  other: "📌",
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
  const { debts, isLoading, updateDebt, deleteDebt } = useDebts();

  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [logPaymentDebt, setLogPaymentDebt] = useState<Debt | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Redirect if not logged in
  if (status === "unauthenticated") {
    router.push("/auth/login");
    return null;
  }

  const totalDebt = debts.reduce((sum, d) => sum + d.amount_owed, 0);

  const getProgressPercent = (debt: Debt) =>
    Math.round(
      ((debt.total_amount - debt.amount_owed) / debt.total_amount) * 100,
    );

  const toggleStatus = async (debt: Debt) => {
    const statuses: Debt["status"][] = [
      "on-track",
      "payment-plan",
      "awaiting-response",
      "overdue",
      "resolved",
    ];
    const nextStatus =
      statuses[(statuses.indexOf(debt.status) + 1) % statuses.length];
    await updateDebt(debt.id, { status: nextStatus });
  };

  const handleLogPayment = async () => {
    if (!paymentAmount || !logPaymentDebt) return;
    setPaymentLoading(true);

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          debt_id: logPaymentDebt.id,
          amount: parseFloat(paymentAmount),
          payment_date: paymentDate,
        }),
      });

      if (!response.ok) throw new Error("Failed to log payment");

      // Update debt in state
      await updateDebt(logPaymentDebt.id, {
        amount_owed: Math.max(
          0,
          logPaymentDebt.amount_owed - parseFloat(paymentAmount),
        ),
      });

      setSuccessMessage(
        `Done! That's £${paymentAmount} less between you and what's next ✓`,
      );
      setPaymentAmount("");

      setTimeout(() => {
        setLogPaymentDebt(null);
        setSuccessMessage("");
        setPaymentDate(new Date().toISOString().split("T")[0]);
      }, 2000);
    } catch (error) {
      console.error("Error logging payment:", error);
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .debt-card { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .debt-card:hover { transform: translateY(-4px); box-shadow: 0 24px 48px rgba(139, 92, 246, 0.15); }
        .progress-bar { background: linear-gradient(90deg, #8b5cf6 0%, #6366f1 100%); transition: width 0.6s ease; }
        .text-accent { background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      `}</style>

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Your debts</h1>
          <p className="text-slate-400 text-sm">
            Track what you owe, celebrate what you've paid
          </p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>

      {/* Monthly Tracker */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              Payment History
            </h2>
            <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors font-medium flex items-center gap-1">
              View detailed tracker <ChevronDown size={14} />
            </button>
          </div>
          <div className="flex gap-3 flex-wrap">
            {months.map((month, idx) => (
              <div key={month} className="flex flex-col items-center gap-2">
                <div className="text-xs text-slate-400 font-medium">
                  {month}
                </div>
                <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                  <span className="text-slate-600 text-xs">—</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-3">
            Total Debt
          </p>
          <p className="text-3xl font-bold text-white">
            £{totalDebt.toLocaleString()}
          </p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-3">
            Monthly Budget
          </p>
          <p className="text-3xl font-bold text-white">£0</p>
          <p className="text-xs text-slate-400 mt-2">for debt repayment</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-3">
            Debt Cleared By
          </p>
          <p className="text-3xl font-bold text-white">—</p>
        </div>
      </div>

      {/* Debt Cards */}
      <div className="max-w-6xl mx-auto">
        {isLoading ? (
          <div className="text-center py-12 text-slate-400">
            Loading your debts...
          </div>
        ) : debts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 mb-2">No debts added yet</p>
            <p className="text-slate-500 text-sm">
              Add your first debt to get started
            </p>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {debts.map((debt) => (
              <div
                key={debt.id}
                className="debt-card bg-slate-900/50 border border-slate-800 rounded-xl p-6 cursor-pointer group"
                onClick={() => setSelectedDebt(debt)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="text-2xl">
                      {categoryIcons[debt.category]}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-base">
                        {debt.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {debt.direct_debit_date
                          ? `DD due: ${debt.direct_debit_date}th`
                          : debt.company}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStatus(debt);
                    }}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg ${statusConfig[debt.status].bgColor} ${statusConfig[debt.status].textColor} ${statusConfig[debt.status].borderColor} border text-xs font-medium hover:opacity-80 transition-all`}
                  >
                    {statusConfig[debt.status].label}
                  </button>
                </div>

                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <p className="text-sm text-white font-medium">
                      £{debt.amount_owed.toLocaleString()} / £
                      {debt.total_amount.toLocaleString()}
                    </p>
                    <p className="text-sm font-semibold text-accent">
                      {getProgressPercent(debt)}%
                    </p>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-3">
                    <div
                      className="progress-bar h-full rounded-full"
                      style={{ width: `${getProgressPercent(debt)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to see details
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLogPaymentDebt(debt);
                        setPaymentAmount("");
                        setPaymentDate(new Date().toISOString().split("T")[0]);
                      }}
                      className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      Log payment →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => router.push("/debts/new")}
          className="w-full border-2 border-dashed border-slate-700 rounded-xl p-6 text-slate-400 hover:text-white hover:border-purple-500/50 transition-all group flex items-center justify-center gap-2"
        >
          <Plus
            size={20}
            className="group-hover:text-purple-400 transition-colors"
          />
          <span className="font-medium">Add a debt</span>
        </button>
      </div>

      {/* Log Payment Modal */}
      {logPaymentDebt && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setLogPaymentDebt(null)}
        >
          <div
            className="w-full max-w-sm bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-1">
              {logPaymentDebt.name}
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              {logPaymentDebt.company}
            </p>

            {successMessage ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-3">✓</div>
                <p className="text-white text-sm">{successMessage}</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-2">
                      Amount
                    </label>
                    <div className="flex items-center">
                      <span className="text-white font-semibold mr-2">£</span>
                      <input
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder="0.00"
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setLogPaymentDebt(null)}
                    className="flex-1 bg-slate-800 text-white font-medium py-2 rounded-lg hover:bg-slate-700 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogPayment}
                    disabled={!paymentAmount || paymentLoading}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium py-2 rounded-lg hover:from-purple-500 hover:to-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {paymentLoading ? "Saving..." : "Log payment"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedDebt && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end z-50 p-4"
          onClick={() => setSelectedDebt(null)}
        >
          <div
            className="w-full max-w-2xl bg-gradient-to-br from-slate-900 to-slate-950 border-t border-slate-800 rounded-t-2xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedDebt(null)}
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-sm font-medium mb-4"
            >
              ← Back
            </button>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {selectedDebt.name}
                </h2>
                <p className="text-sm text-slate-400">{selectedDebt.company}</p>
              </div>
              <button
                onClick={() => setSelectedDebt(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-baseline mb-3">
                <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold">
                  Progress
                </p>
                <p className="text-2xl font-bold text-accent">
                  {getProgressPercent(selectedDebt)}%
                </p>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden mb-3">
                <div
                  className="progress-bar h-full rounded-full"
                  style={{ width: `${getProgressPercent(selectedDebt)}%` }}
                />
              </div>
              <p className="text-sm text-white font-medium">
                £{selectedDebt.amount_owed.toLocaleString()} / £
                {selectedDebt.total_amount.toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b border-slate-800">
              {selectedDebt.account_reference && (
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">
                    Account Ref
                  </p>
                  <p className="text-white font-medium">
                    {selectedDebt.account_reference}
                  </p>
                </div>
              )}
              {selectedDebt.direct_debit_date && (
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">
                    DD Date
                  </p>
                  <p className="text-white font-medium">
                    {selectedDebt.direct_debit_date}th of month
                  </p>
                </div>
              )}
              {selectedDebt.company_email && (
                <div className="col-span-2">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">
                    Email
                  </p>
                  <p className="text-white font-medium">
                    {selectedDebt.company_email}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedDebt(null);
                  setLogPaymentDebt(selectedDebt);
                }}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium py-3 rounded-lg hover:from-purple-500 hover:to-indigo-500 transition-all"
              >
                Log payment
              </button>
              <button
                onClick={() => router.push(`/debts/${selectedDebt.id}/edit`)}
                className="flex-1 bg-slate-800 text-white font-medium py-3 rounded-lg hover:bg-slate-700 transition-colors"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
