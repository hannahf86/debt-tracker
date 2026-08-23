import { CalendarRange } from "lucide-react";
import { describeDue } from "@/lib/due";

/**
 * The direct debit due date, with a countdown.
 *
 * The countdown is the point: a bare "the 2nd" still makes you work out how
 * close that is. Colour escalates when it's imminent, but the words carry the
 * same information so colour is never the only signal.
 */
export default function DueChip({
  dayOfMonth,
}: {
  dayOfMonth: number | null;
}) {
  const due = describeDue(dayOfMonth);
  if (!due) return null;

  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-pill border shrink-0 ${
        due.imminent
          ? "bg-now-100 border-now-200 text-now-600"
          : "bg-mint-100 border-mint-200 text-sage-700"
      }`}
    >
      <CalendarRange size={14} className="shrink-0" />
      <span className="text-xs font-semibold">{due.label}</span>
      <span className="text-xs opacity-80">· {due.relative}</span>
    </div>
  );
}
