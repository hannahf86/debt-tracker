"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useDebts } from "@/lib/hooks/useDebts";
import { CheckCircle, Moon, Clock } from "lucide-react";
import {
  CreditCard,
  Landmark,
  Zap,
  Receipt,
  Home,
  MoreHorizontal,
} from "lucide-react";

const categories = [
  { value: "credit-card", label: "Credit Card" },
  { value: "loan", label: "Loan" },
  { value: "utilities", label: "Utilities" },
  { value: "tax", label: "Tax" },
  { value: "household", label: "Household" },
  { value: "other", label: "Other" },
];

const categoryIcon = (category: string) => {
  const cls = "w-5 h-5";
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

const arrangements = [
  {
    value: "payment-plan",
    label: "Payment plan in place",
    icon: <CheckCircle size={16} className="text-emerald-400" />,
  },
  {
    value: "needs-setting-up",
    label: "Needs setting up",
    icon: <Moon size={16} className="text-blue-400" />,
  },
  {
    value: "awaiting-response",
    label: "Awaiting response",
    icon: <Clock size={16} className="text-amber-400" />,
  },
];

export default function EditDebtPage() {
  const router = useRouter();
  const { id } = router.query;
  const { debts, updateDebt } = useDebts();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    company: "",
    category: "",
    total_amount: "",
    monthly_amount: "",
    arrangement: "",
    direct_debit_date: "",
    account_reference: "",
    company_email: "",
  });

  const debt = debts.find((d) => d.id === id);

  useEffect(() => {
    if (debt) {
      setForm({
        company: debt.company || "",
        category: debt.category || "",
        total_amount: debt.total_amount?.toString() || "",
        monthly_amount: debt.monthly_amount?.toString() || "",
        arrangement: debt.arrangement || "",
        direct_debit_date: debt.direct_debit_date?.toString() || "",
        account_reference: debt.account_reference || "",
        company_email: debt.company_email || "",
      });
    }
  }, [debt]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await updateDebt(id as string, {
        company: form.company,
        name: form.company,
        category: form.category as any,
        total_amount: parseFloat(form.total_amount),
        monthly_amount: form.monthly_amount
          ? parseFloat(form.monthly_amount)
          : null,
        arrangement: form.arrangement as any,
        direct_debit_date: form.direct_debit_date
          ? parseInt(form.direct_debit_date)
          : null,
        account_reference: form.account_reference || null,
        company_email: form.company_email || null,
      });

      router.push(`/debts/${id}`);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  if (!debt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => router.push(`/debts/${id}`)}
          className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-sm font-medium mb-8"
        >
          ← Back
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Edit debt</h1>
          <p className="text-slate-400 text-sm">{debt.company}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Required fields */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              The basics
            </h2>

            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-2">
                Company *
              </label>
              <input
                type="text"
                name="company"
                value={form.company}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-2">
                Category *
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                required
              >
                <option value="" disabled>
                  Select a category
                </option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-2">
                Arrangement *
              </label>
              <div className="space-y-2">
                {arrangements.map((arr) => (
                  <label
                    key={arr.value}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      form.arrangement === arr.value
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-slate-700 bg-slate-800 hover:border-slate-600"
                    }`}
                  >
                    <input
                      type="radio"
                      name="arrangement"
                      value={arr.value}
                      checked={form.arrangement === arr.value}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <span className="text-lg">{arr.icon}</span>
                    <span
                      className={`text-sm font-medium ${form.arrangement === arr.value ? "text-white" : "text-slate-300"}`}
                    >
                      {arr.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-2">
                  Total amount due *
                </label>
                <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500">
                  <span className="text-slate-400 mr-2">£</span>
                  <input
                    type="number"
                    name="total_amount"
                    value={form.total_amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-2">
                  Monthly amount due *
                </label>
                <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500">
                  <span className="text-slate-400 mr-2">£</span>
                  <input
                    type="number"
                    name="monthly_amount"
                    value={form.monthly_amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Optional fields */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              Optional details
            </h2>

            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-2">
                Direct debit date
              </label>
              <input
                type="number"
                name="direct_debit_date"
                value={form.direct_debit_date}
                onChange={handleChange}
                placeholder="e.g. 15 (for the 15th of the month)"
                min="1"
                max="31"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-2">
                Account reference
              </label>
              <input
                type="text"
                name="account_reference"
                value={form.account_reference}
                onChange={handleChange}
                placeholder="e.g. 1234 5678"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-2">
                Company email
              </label>
              <input
                type="email"
                name="company_email"
                value={form.company_email}
                onChange={handleChange}
                placeholder="e.g. accounts@barclays.co.uk"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 rounded-xl hover:from-purple-500 hover:to-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
