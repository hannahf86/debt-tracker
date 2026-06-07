"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useDebts } from "@/lib/hooks/useDebts";
import { Save, AlertTriangle } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { debts } = useDebts();

  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [budgetSaved, setBudgetSaved] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const totalMonthlyDD = debts.reduce(
    (sum, d) => sum + (d.monthly_amount || 0),
    0,
  );

  const handleSaveBudget = async () => {
    try {
      await fetch("/api/users/budget", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monthly_budget: parseFloat(monthlyBudget) }),
      });
      setBudgetSaved(true);
      setTimeout(() => setBudgetSaved(false), 2000);
    } catch (error) {
      console.error("Error saving budget:", error);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
          <p className="text-slate-400 text-sm">
            Manage your account and preferences
          </p>
        </div>

        {/* Account */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-6">Account</h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-2">
                Email address
              </label>
              <input
                type="email"
                value={session?.user?.email || ""}
                disabled
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-2">
                Password
              </label>
              <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors">
                Change password
              </button>
            </div>
          </div>
        </div>

        {/* Budget */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-2">
            Monthly budget
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            How much can you put toward debt each month? Your total monthly DDs
            are{" "}
            <span className="text-white font-medium">
              £{totalMonthlyDD.toLocaleString()}
            </span>
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-2">
                Monthly budget
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500">
                  <span className="text-slate-400 mr-2">£</span>
                  <input
                    type="number"
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleSaveBudget}
                  disabled={!monthlyBudget}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-500 hover:to-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  <Save size={14} />
                  {budgetSaved ? "Saved!" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={18} className="text-red-400" />
            <h2 className="text-lg font-semibold text-red-400">Danger zone</h2>
          </div>
          <p className="text-slate-400 text-sm mb-6">
            Deleting your account is permanent and cannot be undone. All your
            debts, payments and notes will be lost.
          </p>

          {!isDeleting ? (
            <button
              onClick={() => setIsDeleting(true)}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm font-medium transition-all"
            >
              Delete account
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-slate-300 text-sm">
                Type{" "}
                <span className="text-white font-mono font-bold">
                  delete my account
                </span>{" "}
                to confirm
              </p>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="delete my account"
                className="w-full bg-slate-800 border border-red-500/30 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsDeleting(false);
                    setDeleteConfirm("");
                  }}
                  className="flex-1 bg-slate-800 text-white font-medium py-2 rounded-lg hover:bg-slate-700 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  disabled={deleteConfirm !== "delete my account"}
                  className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-medium py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Confirm delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
