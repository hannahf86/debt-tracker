import { Check, Minus, Clock, X, ArrowUp } from "lucide-react";

/**
 * How a logged payment is described wherever it appears. Shared so the
 * desktop month view and the mobile one can't drift apart on wording or
 * colour — the words are neutral by design, never a telling-off.
 */
export type PaymentTypeStyle = {
  label: string;
  /** Text colour class for the label and icon. */
  color: string;
  Icon: typeof Check;
};

const STYLES: Record<string, PaymentTypeStyle> = {
  "on-time": { label: "On time", color: "text-ok-600", Icon: Check },
  late: { label: "Late", color: "text-warn-600", Icon: Clock },
  partial: { label: "Short payment", color: "text-warn-600", Icon: Minus },
  "partial-late": { label: "Short & late", color: "text-alert-600", Icon: X },
  overpaid: { label: "Overpaid", color: "text-brand", Icon: ArrowUp },
};

export function paymentTypeStyle(type: string): PaymentTypeStyle {
  return (
    STYLES[type] ?? { label: type, color: "text-sage-500", Icon: Check }
  );
}

/** "1 Aug" — enough inside a view that already names the month and year. */
export function formatDayMonth(isoDate: string): string {
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
