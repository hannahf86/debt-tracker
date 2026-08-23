"use client";

import { useState } from "react";
import { X, CheckCircle, Check } from "lucide-react";
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
    if (isOver) setStep("overpaid-confirm");
    else if (isShort) setStep("short-reason");
    else if (isLate) setStep("confirm-late");
    else handleSubmit("on-time");
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
          `Nice one! You're ${percent}% to clearing this debt`,
        );
      } else if (getPaymentType() === "late" || overrideType === "late") {
        setSuccessMessage(
          `Logged. Late payments happen — what matters is you're on it`,
        );
      } else if (isShort) {
        setSuccessMessage(`Logged. Every bit counts — keep going`);
      } else {
        setSuccessMessage(
          `Nice one! You're ${percent}% to clearing this debt`,
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
    <div className="p-4 bg-mint-50 border border-mint-200 rounded-xl">
      <p className="text-xs text-sage-500 uppercase tracking-wider font-semibold mb-2">
        Contact
      </p>
      <p className="text-sage-800 text-sm font-medium">{debt.company}</p>
      {debt.company_email && (
        <a
          href={`mailto:${debt.company_email}`}
          className="text-sage-600 hover:text-sage-800 text-sm transition-colors"
        >
          {debt.company_email}
        </a>
      )}
    </div>
  );

  return (
    <div
      className="fixed inset-0 bg-sage-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm max-h-[calc(100dvh-2rem)] overflow-y-auto bg-white border border-mint-200 rounded-2xl p-6 shadow-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-sage-800">{debt.company}</h3>
            {monthlyAmount > 0 && (
              <p className="text-sm text-sage-500 mt-0.5">
                Your monthly DD is{" "}
                <span className="text-sage-700 font-medium">
                  £{monthlyAmount}
                </span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-sage-500 hover:text-sage-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Step: Amount */}
        {step === "amount" && (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-sage-500 uppercase tracking-wider font-semibold block mb-2">
                Amount paid
              </label>
              <div className="flex items-center bg-white border border-mint-200 rounded-lg px-4 py-2 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand">
                <span className="text-sage-500 mr-2">£</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 bg-transparent text-sage-800 placeholder-sage-500 focus:outline-none"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-sage-500 uppercase tracking-wider font-semibold block mb-2">
                Payment date
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full bg-white border border-mint-200 rounded-lg px-4 py-2 text-sage-800 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand"
              />
            </div>

            {parsedAmount > 0 && monthlyAmount > 0 && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  isOver
                    ? "bg-sage-50 border border-sage-200 text-sage-700"
                    : isShort
                      ? "bg-warn-100 border border-warn-200 text-warn-700"
                      : "bg-ok-100 border border-ok-200 text-ok-700"
                }`}
              >
                {isOver &&
                  `£${(parsedAmount - monthlyAmount).toFixed(2)} over your agreed amount`}
                {isShort &&
                  `£${(monthlyAmount - parsedAmount).toFixed(2)} short of your agreed amount`}
                {isCorrect && !isLate && (
                  <>
                    <Check size={14} className="inline-block mr-1.5 -mt-0.5" />
                    Correct amount
                  </>
                )}
                {isCorrect &&
                  isLate &&
                  "Correct amount — you can tell us why it was late next"}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 bg-mint-100 hover:bg-mint-200 text-sage-700 font-medium py-2 rounded-lg transition-colors text-sm border border-mint-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAmountNext}
                disabled={!amount || parsedAmount <= 0}
                className="flex-1 bg-sage-600 hover:bg-sage-700 text-white font-medium py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step: Confirm late */}
        {step === "confirm-late" && (
          <div className="space-y-4">
            <div className="p-4 bg-warn-100 border border-warn-200 rounded-xl">
              <p className="text-warn-700 text-sm font-medium mb-1">
                Payment logged as late
              </p>
              <p className="text-warn-600 text-xs">
                Date entered: {paymentDate}
              </p>
            </div>
            <p className="text-sage-600 text-sm">
              Was the payment actually late, or did you just log it late?
            </p>
            <div className="space-y-2">
              <button
                onClick={() => setStep("late-reason")}
                className="w-full p-3 bg-white border border-mint-200 hover:border-sage-300 rounded-lg text-left transition-all"
              >
                <p className="text-sage-800 text-sm font-medium">
                  It was genuinely late
                </p>
                <p className="text-sage-500 text-xs mt-0.5">
                  I'll tell you why
                </p>
              </button>
              <button
                onClick={() => handleSubmit("on-time")}
                className="w-full p-3 bg-white border border-mint-200 hover:border-ok-200 rounded-lg text-left transition-all"
              >
                <p className="text-sage-800 text-sm font-medium">
                  I just logged it late
                </p>
                <p className="text-sage-500 text-xs mt-0.5">
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
            <p className="text-sage-500 text-xs">
              Their contact details, if you need them.
            </p>
            <div>
              <label className="text-xs text-sage-500 uppercase tracking-wider font-semibold block mb-2">
                Why was it late?{" "}
                <span className="normal-case tracking-normal font-normal text-sage-500">
                  — optional
                </span>
              </label>
              <textarea
                value={lateReason}
                onChange={(e) => setLateReason(e.target.value)}
                placeholder="No judgment — just helps to have it written down..."
                rows={3}
                className="w-full bg-white border border-mint-200 rounded-lg px-4 py-2 text-sage-800 placeholder-sage-500 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand resize-none"
              />
            </div>
            <button
              onClick={() => handleSubmit("late")}
              disabled={isLoading}
              className="w-full bg-sage-600 hover:bg-sage-700 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        )}

        {/* Step: Short reason */}
        {step === "short-reason" && (
          <div className="space-y-4">
            <div className="p-3 bg-warn-100 border border-warn-200 rounded-lg">
              <p className="text-warn-700 text-sm">
                £{(monthlyAmount - parsedAmount).toFixed(2)} short of your
                agreed amount
              </p>
            </div>
            <ContactBox />
            <p className="text-sage-500 text-xs">
              Their contact details, if you need them.
            </p>
            <div>
              <label className="text-xs text-sage-500 uppercase tracking-wider font-semibold block mb-2">
                Why was it short?{" "}
                <span className="normal-case tracking-normal font-normal text-sage-500">
                  — optional
                </span>
              </label>
              <textarea
                value={shortReason}
                onChange={(e) => setShortReason(e.target.value)}
                placeholder="No judgment — just helps to have it written down..."
                rows={3}
                className="w-full bg-white border border-mint-200 rounded-lg px-4 py-2 text-sage-800 placeholder-sage-500 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand resize-none"
              />
            </div>
            <button
              onClick={() => handleSubmit("partial")}
              disabled={isLoading}
              className="w-full bg-sage-600 hover:bg-sage-700 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        )}

        {/* Step: Overpaid confirm */}
        {step === "overpaid-confirm" && (
          <div className="space-y-4">
            <div className="p-3 bg-sage-50 border border-sage-200 rounded-lg">
              <p className="text-sage-700 text-sm font-medium">
                You paid £{(parsedAmount - monthlyAmount).toFixed(2)} extra
              </p>
              <p className="text-sage-500 text-xs mt-1">
                Double check this is right before we log it
              </p>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => handleSubmit("overpaid")}
                disabled={isLoading}
                className="w-full p-3 bg-white border border-mint-200 hover:border-ok-200 rounded-lg text-left transition-all"
              >
                <p className="text-sage-800 text-sm font-medium">
                  Yes, log it — I paid more
                </p>
                <p className="text-sage-500 text-xs mt-0.5">I'm celebrating!</p>
              </button>
              <button
                onClick={() => setStep("amount")}
                className="w-full p-3 bg-white border border-mint-200 hover:border-sage-300 rounded-lg text-left transition-all"
              >
                <p className="text-sage-800 text-sm font-medium">
                  Let me check the amount
                </p>
                <p className="text-sage-500 text-xs mt-0.5">
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
              <CheckCircle size={48} className="text-sage-600" />
            </div>
            <p className="text-sage-700 text-sm">{successMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}
