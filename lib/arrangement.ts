/**
 * How each arrangement state is labelled and styled.
 *
 * Single source of truth — this used to be copied into three pages, which is
 * how the wording drifted. Names the state, never the failure.
 */

export type ArrangementKey =
  | "payment-plan"
  | "needs-setting-up"
  | "awaiting-response"
  | "account-in-default"
  | "default";

type ArrangementStyle = {
  label: string;
  /** Dot colour. */
  dot: string;
  /** Chip shell — neutral unless the state wants attention. */
  chip: string;
};

export const arrangementConfig: Record<ArrangementKey, ArrangementStyle> = {
  "payment-plan": {
    label: "Payment plan in place",
    dot: "bg-ok-600",
    chip: "bg-mint-100 border-mint-200 text-sage-700",
  },
  "needs-setting-up": {
    // An offer, not a demand — "needed" reads as urgent.
    label: "More details can be added",
    dot: "bg-warn-600",
    chip: "bg-warn-100 border-warn-200 text-warn-700",
  },
  "awaiting-response": {
    label: "Awaiting response",
    dot: "bg-warn-600",
    chip: "bg-mint-100 border-mint-200 text-sage-700",
  },
  "account-in-default": {
    label: "Account in default",
    dot: "bg-alert-600",
    chip: "bg-mint-100 border-mint-200 text-sage-700",
  },
  default: {
    label: "Not set",
    dot: "bg-sage-400",
    chip: "bg-mint-100 border-mint-200 text-sage-700",
  },
};

export function arrangementStyle(
  arrangement: string | null | undefined,
): ArrangementStyle {
  return (
    arrangementConfig[(arrangement ?? "default") as ArrangementKey] ??
    arrangementConfig.default
  );
}
