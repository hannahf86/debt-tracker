"use client";

import { useState } from "react";
import { CheckCircle, X } from "lucide-react";
import type { Debt } from "@/lib/types";

type Step =
  | "amount"
  | "confirm-late"
  | "late-reason"
  | "short-reason"
  | "overpaid-confirm"
  | "success";

type Props = {
  debt: Debt;
  onClose: () => void;
  onSuccess: (newAmountOwed: number) => void;
};

export default function LogPaymentModal({ debt, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [lateReason, setLateReason] = useState("");
  const [shortReason, setShortReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const monthlyAmount = debt.monthly_amount || 0;
  const parsedAmount = parseFloat(amount) || 0;
  const isToday = paymentDate === new Date().toISOString().split("T")[0];
  const isLate = !isToday;
  const isShort = parsedAmount < monthlyAmount && parsedAmount > 0;
  const isOver = parsedAmount > monthlyAmount;
  const isCorrect = parsedAmount === monthlyAmount;

  const getPaymentType = () => {
    if (isShort && isLate) return "partial-late";
    if (isShort) return "partial";
    if (isLate) return "late";
    return "on-time";
  };

  const handleAmountNext = () => {
    if (!amount || parsedAmount <= 0) return;

    if (isOver) {
      setStep("overpaid-confirm");
    } else if (isShort) {
      setStep("short-reason");
    } else if (isLate) {
      setStep("confirm-late");
    } else {
      handleSubmit("on-time");
    }
  };

  const handleSubmit = async (overrideType?: string) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          debt_id: debt.id,
          amount: parsedAmount,
          payment_date: paymentDate,
          payment_type: overrideType || getPaymentType(),
          expected_amount: monthlyAmount,
          late_reason: lateReason || null,
          short_reason: shortReason || null,
        }),
      });

      if (!response.ok) throw new Error("Failed to log payment");

      const newAmountOwed = Math.max(0, debt.amount_owed - parsedAmount);
      const percent = Math.round(
        ((debt.total_amount - newAmountOwed) / debt.total_amount) * 100,
      );

      if (overrideType === "on-time" || overrideType === "overpaid") {
        setSuccessMessage(
          `Nice one! You're ${percent}% to clearing this debt 💪`,
        );
      } else if (getPaymentType() === "late" || overrideType === "late") {
        setSuccessMessage(
          `Logged. Late payments happen — what matters is you're on it ✓`,
        );
      } else if (isShort) {
        setSuccessMessage(`Logged. Every bit counts — keep going ✓`);
      } else {
        setSuccessMessage(
          `Nice one! You're ${percent}% to clearing this debt 💪`,
        );
      }

      setStep("success");
      onSuccess(newAmountOwed);
    } catch (error) {
      console.error("Error logging payment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const ContactBox = () => (
    <div className="p-4 bg-slate-800/50 rounded-xl">
      <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">
        Contact
      </p>
      <p className="text-white text-sm font-medium">{debt.company}</p>
      {debt.company_email && (
        <a
          href={`mailto:${debt.company_email}`}
          className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
        >
          {debt.company_email}
        </a>
      )}
    </div>
  );

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">{debt.company}</h3>
            {monthlyAmount > 0 && (
              <p className="text-sm text-slate-400 mt-0.5">
                £{monthlyAmount}/month agreed
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Step: Amount */}
        {step === "amount" && (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-2">
                Amount paid
              </label>
              <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500">
                <span className="text-white font-semibold mr-2">£</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-2">
                Payment date
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>

            {parsedAmount > 0 && monthlyAmount > 0 && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  isOver
                    ? "bg-blue-500/10 border border-blue-500/20 text-blue-300"
                    : isShort
                      ? "bg-amber-500/10 border border-amber-500/20 text-amber-300"
                      : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
                }`}
              >
                {isOver &&
                  `£${(parsedAmount - monthlyAmount).toFixed(2)} over your agreed amount`}
                {isShort &&
                  `£${(monthlyAmount - parsedAmount).toFixed(2)} short of your agreed amount`}
                {isCorrect && !isLate && "✓ Correct amount"}
                {isCorrect &&
                  isLate &&
                  "Correct amount — you can tell us why it was late next"}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 bg-slate-800 text-white font-medium py-2 rounded-lg hover:bg-slate-700 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAmountNext}
                disabled={!amount || parsedAmount <= 0}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium py-2 rounded-lg hover:from-purple-500 hover:to-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step: Confirm late */}
        {step === "confirm-late" && (
          <div className="space-y-4">
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <p className="text-amber-300 text-sm font-medium mb-1">
                Payment logged as late
              </p>
              <p className="text-slate-400 text-xs">
                Date entered: {paymentDate}
              </p>
            </div>

            <p className="text-slate-300 text-sm">
              Was the payment actually late, or did you just log it late?
            </p>

            <div className="space-y-2">
              <button
                onClick={() => setStep("late-reason")}
                className="w-full p-3 bg-slate-800 border border-slate-700 hover:border-amber-500/50 rounded-lg text-left transition-all"
              >
                <p className="text-white text-sm font-medium">
                  It was genuinely late
                </p>
                <p className="text-slate-400 text-xs mt-0.5">
                  I'll tell you why
                </p>
              </button>
              <button
                onClick={() => handleSubmit("on-time")}
                className="w-full p-3 bg-slate-800 border border-slate-700 hover:border-emerald-500/50 rounded-lg text-left transition-all"
              >
                <p className="text-white text-sm font-medium">
                  I just logged it late
                </p>
                <p className="text-slate-400 text-xs mt-0.5">
                  Payment went out on time, I forgot to log it
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Step: Late reason */}
        {step === "late-reason" && (
          <div className="space-y-4">
            <ContactBox />
            <p className="text-slate-400 text-xs">
              💡 It's worth letting them know what happened
            </p>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-2">
                Why was it late?
              </label>
              <textarea
                value={lateReason}
                onChange={(e) => setLateReason(e.target.value)}
                placeholder="No judgment — just helps to have it written down..."
                rows={3}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none"
              />
            </div>
            <button
              onClick={() => handleSubmit("late")}
              disabled={!lateReason || isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 rounded-xl hover:from-purple-500 hover:to-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        )}

        {/* Step: Short reason */}
        {step === "short-reason" && (
          <div className="space-y-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-amber-300 text-sm">
                £{(monthlyAmount - parsedAmount).toFixed(2)} short of your
                agreed amount
              </p>
            </div>
            <ContactBox />
            <p className="text-slate-400 text-xs">
              💡 Let them know you've paid what you can right now
            </p>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-2">
                Why was it short?
              </label>
              <textarea
                value={shortReason}
                onChange={(e) => setShortReason(e.target.value)}
                placeholder="No judgment — just helps to have it written down..."
                rows={3}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none"
              />
            </div>
            <button
              onClick={() => handleSubmit("partial")}
              disabled={!shortReason || isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 rounded-xl hover:from-purple-500 hover:to-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        )}

        {/* Step: Overpaid confirm */}
        {step === "overpaid-confirm" && (
          <div className="space-y-4">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-blue-300 text-sm font-medium">
                You paid £{(parsedAmount - monthlyAmount).toFixed(2)} extra 👀
              </p>
              <p className="text-slate-400 text-xs mt-1">
                Double check this is right before we log it
              </p>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => handleSubmit("overpaid")}
                disabled={isLoading}
                className="w-full p-3 bg-slate-800 border border-slate-700 hover:border-emerald-500/50 rounded-lg text-left transition-all"
              >
                <p className="text-white text-sm font-medium">
                  Yes, log it — I paid more 🎉
                </p>
                <p className="text-slate-400 text-xs mt-0.5">
                  I'm celebrating!
                </p>
              </button>
              <button
                onClick={() => setStep("amount")}
                className="w-full p-3 bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-lg text-left transition-all"
              >
                <p className="text-white text-sm font-medium">
                  Let me check the amount
                </p>
                <p className="text-slate-400 text-xs mt-0.5">
                  Go back and correct it
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Step: Success */}
        {step === "success" && (
          <div className="text-center py-6">
            <div className="flex justify-center mb-3">
              <CheckCircle size={48} className="text-emerald-400" />
            </div>{" "}
            <p className="text-white text-sm">{successMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}
