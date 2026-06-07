"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useDebts } from "@/lib/hooks/useDebts";
import { Save, AlertTriangle } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { debts } = useDebts();

  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [budgetSaved, setBudgetSaved] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

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

  const handleChangePassword = async () => {
    setPasswordError("");
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    setIsPasswordLoading(true);
    try {
      const res = await fetch("/api/users/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });

      if (!res.ok) throw new Error("Failed to change password");

      setPasswordSaved(true);
      setNewPassword("");
      setConfirmPassword("");
      setShowChangePassword(false);
      setTimeout(() => setPasswordSaved(false), 3000);
    } catch (error) {
      setPasswordError("Something went wrong. Please try again.");
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleteLoading(true);
    try {
      const res = await fetch("/api/users/delete", {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete account");

      await signOut({ callbackUrl: "/auth/login" });
    } catch (error) {
      console.error("Error deleting account:", error);
      setIsDeleteLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-sage-800 mb-2">Settings</h1>
          <p className="text-sage-500 text-sm">
            Manage your account and preferences
          </p>
        </div>

        {/* Account */}
        <div className="bg-white/60 backdrop-blur-sm border border-mint-200 rounded-2xl p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-sage-800 mb-6">Account</h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-sage-500 uppercase tracking-wider font-semibold block mb-2">
                Email address
              </label>
              <input
                type="email"
                value={session?.user?.email || ""}
                disabled
                className="w-full bg-mint-50 border border-mint-200 rounded-lg px-4 py-2 text-sage-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-xs text-sage-500 uppercase tracking-wider font-semibold block mb-2">
                Password
              </label>

              {passwordSaved && (
                <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p className="text-emerald-700 text-sm">
                    Password updated successfully!
                  </p>
                </div>
              )}

              {!showChangePassword ? (
                <button
                  onClick={() => setShowChangePassword(true)}
                  className="px-4 py-2 bg-mint-100 hover:bg-mint-200 text-sage-700 rounded-lg text-sm font-medium transition-colors border border-mint-200"
                >
                  Change password
                </button>
              ) : (
                <div className="space-y-3">
                  {passwordError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 text-sm">{passwordError}</p>
                    </div>
                  )}
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                    className="w-full bg-white border border-mint-200 rounded-lg px-4 py-2 text-sage-800 placeholder-sage-300 focus:outline-none focus:border-sage-400 focus:ring-1 focus:ring-sage-400"
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full bg-white border border-mint-200 rounded-lg px-4 py-2 text-sage-800 placeholder-sage-300 focus:outline-none focus:border-sage-400 focus:ring-1 focus:ring-sage-400"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowChangePassword(false);
                        setPasswordError("");
                        setNewPassword("");
                        setConfirmPassword("");
                      }}
                      className="flex-1 bg-mint-100 hover:bg-mint-200 text-sage-700 font-medium py-2 rounded-lg transition-colors text-sm border border-mint-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleChangePassword}
                      disabled={
                        !newPassword || !confirmPassword || isPasswordLoading
                      }
                      className="flex-1 bg-sage-600 hover:bg-sage-700 text-white font-medium py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {isPasswordLoading ? "Saving..." : "Update password"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Budget */}
        <div className="bg-white/60 backdrop-blur-sm border border-mint-200 rounded-2xl p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-sage-800 mb-2">
            Monthly budget
          </h2>
          <p className="text-sage-500 text-sm mb-6">
            How much can you put toward debt each month? Your total monthly DDs
            are{" "}
            <span className="text-sage-700 font-medium">
              £{totalMonthlyDD.toLocaleString()}
            </span>
          </p>

          <div>
            <label className="text-xs text-sage-500 uppercase tracking-wider font-semibold block mb-2">
              Monthly budget
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center flex-1 bg-white border border-mint-200 rounded-lg px-4 py-2 focus-within:border-sage-400 focus-within:ring-1 focus-within:ring-sage-400">
                <span className="text-sage-400 mr-2">£</span>
                <input
                  type="number"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 bg-transparent text-sage-800 placeholder-sage-300 focus:outline-none"
                />
              </div>
              <button
                onClick={handleSaveBudget}
                disabled={!monthlyBudget}
                className="flex items-center gap-2 px-4 py-2 bg-sage-600 hover:bg-sage-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                <Save size={14} />
                {budgetSaved ? "Saved!" : "Save"}
              </button>
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={18} className="text-red-400" />
            <h2 className="text-lg font-semibold text-red-500">Danger zone</h2>
          </div>
          <p className="text-sage-500 text-sm mb-6">
            Deleting your account is permanent and cannot be undone. All your
            debts, payments and notes will be lost.
          </p>

          {!isDeleting ? (
            <button
              onClick={() => setIsDeleting(true)}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 rounded-lg text-sm font-medium transition-all"
            >
              Delete account
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sage-600 text-sm">
                Type{" "}
                <span className="text-sage-800 font-mono font-bold">
                  delete my account
                </span>{" "}
                to confirm
              </p>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="delete my account"
                className="w-full bg-white border border-red-200 rounded-lg px-4 py-2 text-sage-800 placeholder-sage-300 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsDeleting(false);
                    setDeleteConfirm("");
                  }}
                  className="flex-1 bg-mint-100 hover:bg-mint-200 text-sage-700 font-medium py-2 rounded-lg transition-colors text-sm border border-mint-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={
                    deleteConfirm !== "delete my account" || isDeleteLoading
                  }
                  className="flex-1 bg-red-100 hover:bg-red-200 text-red-500 border border-red-200 font-medium py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isDeleteLoading ? "Deleting..." : "Confirm delete"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
