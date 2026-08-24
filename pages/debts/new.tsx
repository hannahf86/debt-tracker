"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { CheckCircle, Moon, Clock } from "lucide-react";

const categories = [
  { value: "credit-card", label: "Credit Card" },
  { value: "loan", label: "Loan" },
  { value: "utilities", label: "Utilities" },
  { value: "tax", label: "Tax" },
  { value: "household", label: "Household" },
  { value: "other", label: "Other" },
];

const arrangements = [
  {
    value: "payment-plan",
    label: "Payment plan in place",
    icon: <CheckCircle size={16} className="text-ok-600" />,
  },
  {
    value: "needs-setting-up",
    label: "More details can be added",
    icon: <Clock size={16} className="text-warn-600" />,
  },
  {
    value: "awaiting-response",
    label: "Awaiting response",
    icon: <Moon size={16} className="text-info-600" />,
  },
];

export default function NewDebtPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    company: "",
    amount_owed: "",
    total_amount: "",
    monthly_amount: "",
    category: "",
    arrangement: "",
    direct_debit_date: "",
    account_reference: "",
    company_email: "",
  });

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
      const response = await fetch("/api/debts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          name: form.company,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong");
        setIsLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => router.push("/dashboard")}
          className="hidden md:flex text-sage-500 hover:text-sage-700 transition-colors items-center gap-1 text-sm font-medium mb-8"
        >
          ← Back
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-sage-800 mb-2">Add a debt</h1>
          <p className="text-sage-500 text-sm">
            No judgment here. Let's get it tracked.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-alert-100 border border-alert-200 rounded-lg">
            <p className="text-sm text-alert-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white border border-mint-200 rounded-2xl p-5 md:p-6 space-y-4 shadow-sm">
            <h2 className="text-sm font-semibold text-sage-500 uppercase tracking-wider">
              The basics
            </h2>

            <div>
              <label
                htmlFor="company"
                className="text-xs text-sage-500 uppercase tracking-wider font-semibold block mb-2"
              >
                Company *
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={form.company}
                onChange={handleChange}
                placeholder="e.g. Barclays"
                className="w-full min-h-[48px] bg-white border border-mint-200 rounded-lg px-4 py-2 text-sage-800 placeholder-sage-500 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand"
                required
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="text-xs text-sage-500 uppercase tracking-wider font-semibold block mb-2"
              >
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full min-h-[48px] bg-white border border-mint-200 rounded-lg px-4 py-2 text-sage-800 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand"
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

            {/* A real radio group: sr-only rather than hidden, so it stays
                focusable and announced. The label shows the focus ring. */}
            <fieldset>
              <legend className="text-xs text-sage-500 uppercase tracking-wider font-semibold mb-2">
                Arrangement *
              </legend>
              <div className="space-y-2">
                {arrangements.map((arr) => (
                  <label
                    key={arr.value}
                    className={`flex items-center gap-3 min-h-[48px] px-3 py-2.5 rounded-lg border cursor-pointer transition-all focus-within:border-brand focus-within:ring-2 focus-within:ring-brand ${
                      form.arrangement === arr.value
                        ? "border-sage-400 bg-sage-50"
                        : "border-mint-200 bg-white hover:border-sage-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="arrangement"
                      value={arr.value}
                      checked={form.arrangement === arr.value}
                      onChange={handleChange}
                      required
                      className="sr-only"
                    />
                    <span aria-hidden="true">{arr.icon}</span>
                    <span
                      className={`text-sm font-medium ${form.arrangement === arr.value ? "text-sage-800" : "text-sage-600"}`}
                    >
                      {arr.label}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="total_amount"
                  className="text-xs text-sage-500 uppercase tracking-wider font-semibold block mb-2"
                >
                  Total amount due *
                </label>
                <div className="flex items-center min-h-[48px] bg-white border border-mint-200 rounded-lg px-4 py-2 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand">
                  <span className="text-sage-500 mr-2">£</span>
                  <input
                    type="number"
                    id="total_amount"
                    name="total_amount"
                    value={form.total_amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full self-stretch min-h-[44px] bg-transparent text-sage-800 placeholder-sage-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="monthly_amount"
                  className="text-xs text-sage-500 uppercase tracking-wider font-semibold block mb-2"
                >
                  Monthly amount due *
                </label>
                <div className="flex items-center min-h-[48px] bg-white border border-mint-200 rounded-lg px-4 py-2 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand">
                  <span className="text-sage-500 mr-2">£</span>
                  <input
                    type="number"
                    id="monthly_amount"
                    name="monthly_amount"
                    value={form.monthly_amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full self-stretch min-h-[44px] bg-transparent text-sage-800 placeholder-sage-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-mint-200 rounded-2xl p-5 md:p-6 space-y-4 shadow-sm">
            <div>
              <h2 className="text-sm font-semibold text-sage-500 uppercase tracking-wider">
                Payment details
              </h2>
              <p className="text-sm text-sage-600 mt-2">
                Mirian needs these to track this debt properly. Fill in what
                you have now — you can come back for the rest, and we&rsquo;ll
                remind you what&rsquo;s still missing.
              </p>
            </div>

            <div>
              <label
                htmlFor="direct_debit_date"
                className="text-xs text-sage-500 uppercase tracking-wider font-semibold block mb-2"
              >
                Direct debit date
              </label>
              <input
                type="number"
                id="direct_debit_date"
                name="direct_debit_date"
                value={form.direct_debit_date}
                onChange={handleChange}
                placeholder="e.g. 15 (for the 15th of the month)"
                min="1"
                max="31"
                className="w-full min-h-[48px] bg-white border border-mint-200 rounded-lg px-4 py-2 text-sage-800 placeholder-sage-500 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand"
              />
            </div>

            <div>
              <label
                htmlFor="account_reference"
                className="text-xs text-sage-500 uppercase tracking-wider font-semibold block mb-2"
              >
                Account reference
              </label>
              <input
                type="text"
                id="account_reference"
                name="account_reference"
                value={form.account_reference}
                onChange={handleChange}
                placeholder="e.g. 1234 5678"
                className="w-full min-h-[48px] bg-white border border-mint-200 rounded-lg px-4 py-2 text-sage-800 placeholder-sage-500 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand"
              />
            </div>

            <div>
              <label
                htmlFor="company_email"
                className="text-xs text-sage-500 uppercase tracking-wider font-semibold block mb-2"
              >
                Company email
              </label>
              <input
                type="email"
                id="company_email"
                name="company_email"
                value={form.company_email}
                onChange={handleChange}
                placeholder="e.g. accounts@barclays.co.uk"
                className="w-full min-h-[48px] bg-white border border-mint-200 rounded-lg px-4 py-2 text-sage-800 placeholder-sage-500 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full min-h-[52px] bg-sage-600 hover:bg-sage-700 text-white font-semibold rounded-pill transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Adding debt..." : "Add debt"}
          </button>
        </form>
      </div>
    </div>
  );
}
