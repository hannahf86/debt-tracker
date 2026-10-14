import Link from "next/link";
import type { Entitlement } from "@/lib/entitlement";

/**
 * What the free period is doing, said once, at the top of the dashboard.
 *
 * Silent for most of the trial. It speaks in the last fortnight, and again
 * when the trial has ended — and when it does, it leads with what someone
 * still has rather than what they've lost.
 */
export default function TrialNotice({
  entitlement,
}: {
  entitlement: Entitlement;
}) {
  const { state, trialDaysLeft } = entitlement;

  if (state === "tester" || state === "paid") return null;

  if (state === "trial") {
    // Nothing to say until it's close enough to matter.
    if (trialDaysLeft === null || trialDaysLeft > 14) return null;

    return (
      <div className="max-w-6xl mx-auto mb-6">
        <div className="bg-mint-50 border border-mint-200 rounded-xl px-5 py-4">
          <p className="text-sage-800 text-sm font-semibold">
            {trialDaysLeft <= 0
              ? "Your free three months end today"
              : `Your free three months end in ${trialDaysLeft} ${
                  trialDaysLeft === 1 ? "day" : "days"
                }`}
          </p>
          <p className="text-sage-600 text-sm mt-1">
            Nothing happens automatically and there&rsquo;s no card on file.
            After that you can keep reading everything you&rsquo;ve logged, and
            adding new payments costs £5 a month whenever you choose to.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mb-6">
      <div className="bg-mint-50 border border-mint-200 rounded-xl px-5 py-5">
        <p className="font-display text-lg font-bold text-sage-800">
          Your free three months are up
        </p>
        <p className="text-sage-700 text-sm mt-2">
          Everything you&rsquo;ve logged is still here, and it stays here. You
          can read it, download the lot as a PDF, and delete it whenever you
          like. The only thing that stops is adding new payments.
        </p>
        <p className="text-sage-700 text-sm mt-2">
          It&rsquo;s £5 a month to start again, and nothing is owed for the
          months in between.
        </p>
        <div className="flex flex-wrap gap-3 mt-4">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center min-h-[48px] px-5 rounded-pill bg-sage-600 hover:bg-sage-700 text-white text-sm font-semibold transition-colors"
          >
            Start adding payments again
          </Link>
          <Link
            href="/settings/data"
            className="inline-flex items-center justify-center min-h-[48px] px-5 rounded-pill border border-mint-200 text-sage-700 hover:bg-mint-100 text-sm font-semibold transition-colors"
          >
            Download my record
          </Link>
        </div>
      </div>
    </div>
  );
}
