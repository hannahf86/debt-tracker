"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { CheckCircle, Moon, Clock } from "lucide-react";

const steps = [
  { id: 1, label: "Welcome" },
  { id: 2, label: "What to expect" },
  { id: 3, label: "First debt" },
  { id: 4, label: "You're in" },
];

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
    icon: <CheckCircle size={16} className="text-emerald-500" />,
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

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    company: "",
    category: "",
    arrangement: "",
    total_amount: "",
    amount_owed: "",
    monthly_amount: "",
    direct_debit_date: "",
    account_reference: "",
    company_email: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-peach-300 via-peach-100 to-mint-100 flex items-center justify-center">
        <p className="text-sage-500">Loading...</p>
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddDebt = async () => {
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
      setStep(4);
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-peach-300 via-peach-100 to-mint-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress indicator */}
        {step < 4 && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {steps.map((s) => (
              <div key={s.id} className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full transition-all ${
                    s.id === step
                      ? "bg-sage-600 w-6"
                      : s.id < step
                        ? "bg-sage-400"
                        : "bg-peach-300"
                  }`}
                />
              </div>
            ))}
            <span className="text-sage-500 text-xs ml-2">{step} of 3</span>
          </div>
        )}

        {/* Step 1 — Welcome */}
        {step === 1 && (
          <div className="text-center">
            <img
              src="/logo-green.svg"
              alt="Mirian logo"
              className="h-20 w-auto mx-auto mb-8"
            />
            <h1 className="text-4xl font-bold text-sage-800 mb-4">
              Welcome to Mirian.
            </h1>
            <p className="text-sage-600 text-lg mb-4 max-w-sm mx-auto leading-relaxed">
              Your finances, your pace.
            </p>
            <p className="text-sage-500 mb-12 max-w-sm mx-auto leading-relaxed">
              No spreadsheets. No shame. No judgment. Just a calm, clear place
              to track what you owe and celebrate what you've paid.
            </p>
            <button
              onClick={() => setStep(2)}
              className="w-full max-w-sm mx-auto block bg-sage-600 hover:bg-sage-700 text-white font-semibold py-4 rounded-xl transition-all text-lg"
            >
              Let's go →
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="mt-4 text-sage-400 hover:text-sage-600 text-sm transition-colors block mx-auto"
            >
              Skip for now
            </button>
          </div>
        )}

        {/* Step 2 — What to expect */}
        {step === 2 && (
          <div className="bg-white/60 backdrop-blur-sm border border-mint-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-sage-800 mb-2">
              Here's what Mirian does.
            </h2>
            <p className="text-sage-500 text-sm mb-8">
              Three things, nothing more.
            </p>

            <div className="space-y-6 mb-10">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center flex-shrink-0 text-xl">
                  🌱
                </div>
                <div>
                  <p className="text-sage-800 font-semibold">
                    Tracks what you owe
                  </p>
                  <p className="text-sage-500 text-sm mt-0.5">
                    All your debts in one place. No more guessing.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center flex-shrink-0 text-xl">
                  ✓
                </div>
                <div>
                  <p className="text-sage-800 font-semibold">
                    Logs payments without guilt
                  </p>
                  <p className="text-sage-500 text-sm mt-0.5">
                    Paid late? Paid short? That's okay. We just log it.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center flex-shrink-0 text-xl">
                  📍
                </div>
                <div>
                  <p className="text-sage-800 font-semibold">
                    Shows your progress
                  </p>
                  <p className="text-sage-500 text-sm mt-0.5">
                    Every payment moves the needle. Mirian shows you how far
                    you've come.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(3)}
              className="w-full bg-sage-600 hover:bg-sage-700 text-white font-semibold py-3 rounded-xl transition-all"
            >
              Add my first debt →
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="mt-3 text-sage-400 hover:text-sage-600 text-sm transition-colors block mx-auto text-center"
            >
              Skip for now
            </button>
          </div>
        )}

        {/* Step 3 — Add first debt */}
        {step === 3 && (
          <div className="bg-white/60 backdrop-blur-sm border border-mint-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-sage-800 mb-2">
              Let's start with one debt.
            </h2>
            <p className="text-sage-500 text-sm mb-8">
              Just one. You can add the rest whenever you're ready.
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-xs text-sage-500 uppercase tracking-wider font-semibold block mb-2">
                  Who do you owe? *
                </label>
                <input
                  type="text"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="e.g. Barclays, HMRC, EON"
                  className="w-full bg-white border border-mint-200 rounded-lg px-4 py-2 text-sage-800 placeholder-sage-300 focus:outline-none focus:border-sage-400 focus:ring-1 focus:ring-sage-400"
                />
              </div>

              <div>
                <label className="text-xs text-sage-500 uppercase tracking-wider font-semibold block mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full bg-white border border-mint-200 rounded-lg px-4 py-2 text-sage-800 focus:outline-none focus:border-sage-400 focus:ring-1 focus:ring-sage-400"
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
                <label className="text-xs text-sage-500 uppercase tracking-wider font-semibold block mb-2">
                  What's the situation? *
                </label>
                <div className="space-y-2">
                  {arrangements.map((arr) => (
                    <label
                      key={arr.value}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
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
                        className="hidden"
                      />
                      <span>{arr.icon}</span>
                      <span
                        className={`text-sm font-medium ${form.arrangement === arr.value ? "text-sage-800" : "text-sage-600"}`}
                      >
                        {arr.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-sage-500 uppercase tracking-wider font-semibold block mb-2">
                    Total owed *
                  </label>
                  <div className="flex items-center bg-white border border-mint-200 rounded-lg px-4 py-2 focus-within:border-sage-400 focus-within:ring-1 focus-within:ring-sage-400">
                    <span className="text-sage-400 mr-2">£</span>
                    <input
                      type="number"
                      name="total_amount"
                      value={form.total_amount}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="w-full bg-transparent text-sage-800 placeholder-sage-300 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-sage-500 uppercase tracking-wider font-semibold block mb-2">
                    Monthly payment *
                  </label>
                  <div className="flex items-center bg-white border border-mint-200 rounded-lg px-4 py-2 focus-within:border-sage-400 focus-within:ring-1 focus-within:ring-sage-400">
                    <span className="text-sage-400 mr-2">£</span>
                    <input
                      type="number"
                      name="monthly_amount"
                      value={form.monthly_amount}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="w-full bg-transparent text-sage-800 placeholder-sage-300 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleAddDebt}
              disabled={
                !form.company ||
                !form.category ||
                !form.arrangement ||
                !form.total_amount ||
                !form.monthly_amount ||
                isLoading
              }
              className="w-full mt-8 bg-sage-600 hover:bg-sage-700 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Adding..." : "Add debt →"}
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="mt-3 text-sage-400 hover:text-sage-600 text-sm transition-colors block mx-auto text-center"
            >
              Skip for now
            </button>
          </div>
        )}

        {/* Step 4 — You're in */}
        {step === 4 && (
          <div className="text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold text-sage-800 mb-4">
              You're all set.
            </h2>
            <p className="text-sage-600 mb-3 max-w-sm mx-auto leading-relaxed">
              One debt tracked is better than none.
            </p>
            <p className="text-sage-500 text-sm mb-12 max-w-sm mx-auto leading-relaxed">
              You can add more debts anytime, log payments as they happen, and
              watch your total get smaller. You've got this. 💪
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full max-w-sm mx-auto block bg-sage-600 hover:bg-sage-700 text-white font-semibold py-4 rounded-xl transition-all text-lg"
            >
              Go to my dashboard →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
