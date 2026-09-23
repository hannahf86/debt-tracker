"use client";

import { Minus, Percent } from "lucide-react";

/**
 * Interest on a debt: whether it's being added, and the rate if it is.
 *
 * Shared by the add and edit forms so the two can't drift apart.
 *
 * Frozen is the default and the first option, because most people on a
 * payment plan, a DMP or a defaulted account have interest stopped. The
 * question is still asked out loud rather than assumed quietly: a wrong
 * assumption nobody can see is how a balance stops making sense.
 */

type Props = {
  state: string;
  rate: string;
  onChange: (next: { interest_state: string; interest_rate: string }) => void;
};

const OPTIONS = [
  {
    value: "frozen",
    label: "No, it's frozen or there isn't any",
    icon: <Minus size={16} className="text-ok-600" />,
  },
  {
    value: "charged",
    label: "Yes, interest is being added",
    icon: <Percent size={16} className="text-warn-600" />,
  },
];

export default function InterestFields({ state, rate, onChange }: Props) {
  const charged = state === "charged";

  return (
    <fieldset>
      <legend className="text-xs text-sage-500 uppercase tracking-wider font-semibold mb-2">
        Is interest being added?
      </legend>
      <p className="text-sm text-sage-600 mb-3">
        If you&rsquo;re on a payment plan or the account has defaulted,
        it&rsquo;s usually stopped. Not sure? Leave it as no — you can change
        this whenever you find out.
      </p>

      <div className="space-y-2">
        {OPTIONS.map((option) => (
          <label
            key={option.value}
            className={`flex items-center gap-3 min-h-[48px] px-4 bg-white border rounded-lg cursor-pointer transition-colors ${
              state === option.value
                ? "border-brand ring-2 ring-brand"
                : "border-mint-200 hover:border-mint-300"
            }`}
          >
            <input
              type="radio"
              name="interest_state"
              value={option.value}
              checked={state === option.value}
              onChange={() =>
                onChange({
                  interest_state: option.value,
                  // Switching to frozen clears the rate: leaving an old number
                  // behind would be a figure nobody meant.
                  interest_rate: option.value === "charged" ? rate : "",
                })
              }
              className="sr-only"
            />
            {option.icon}
            <span
              className={`text-sm font-medium ${
                state === option.value ? "text-sage-800" : "text-sage-600"
              }`}
            >
              {option.label}
            </span>
          </label>
        ))}
      </div>

      {charged && (
        <div className="mt-4">
          <label
            htmlFor="interest_rate"
            className="text-xs text-sage-500 uppercase tracking-wider font-semibold block mb-2"
          >
            Interest rate
          </label>
          <div className="flex items-center min-h-[48px] bg-white border border-mint-200 rounded-lg px-4 py-2 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand">
            <input
              type="number"
              id="interest_rate"
              name="interest_rate"
              inputMode="decimal"
              step="0.1"
              min="0"
              max="200"
              value={rate}
              onChange={(e) =>
                onChange({ interest_state: state, interest_rate: e.target.value })
              }
              placeholder="e.g. 24.9"
              className="w-full self-stretch min-h-[44px] bg-transparent text-sage-800 placeholder-sage-500 focus:outline-none"
            />
            <span className="text-sage-500 ml-2">%</span>
          </div>
          <p className="text-sm text-sage-600 mt-2">
            Your statement calls it APR. Mirian uses it to show how much of each
            payment goes on interest — a close estimate, not the
            company&rsquo;s own figure.
          </p>
        </div>
      )}
    </fieldset>
  );
}
