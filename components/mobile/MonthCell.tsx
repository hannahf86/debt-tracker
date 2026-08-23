import { Check, Minus, X, MapPin } from "lucide-react";
import type { MonthStatus } from "@/lib/hooks/useTracker";

/**
 * One month's state. Colour is never the only signal — each state carries a
 * distinct glyph and an accessible word.
 */

const STATE = {
  paid: {
    word: "Paid",
    cls: "bg-ok-100 border-ok-200 text-ok-600",
    Icon: Check,
  },
  partial: {
    word: "Part paid",
    cls: "bg-warn-100 border-warn-200 text-warn-600",
    Icon: Minus,
  },
  missed: {
    word: "Nothing logged",
    cls: "bg-alert-100 border-alert-200 text-alert-600",
    Icon: X,
  },
  current: {
    word: "This month",
    cls: "bg-now-100 border-now-200 text-now-600",
    Icon: MapPin,
  },
  now: {
    word: "This month",
    cls: "bg-now-100 border-now-200 text-now-600",
    Icon: MapPin,
  },
  future: { word: "Not yet", cls: "bg-paper-sunk border-mint-200 text-sage-500", Icon: null },
  "before-signup": {
    word: "Not yet",
    cls: "bg-paper-sunk border-mint-200 text-sage-500",
    Icon: null,
  },
} as const;

export default function MonthCell({
  status,
  label,
  size = 38,
  onClick,
}: {
  status: MonthStatus;
  /** Becomes the accessible name, e.g. "March — paid". */
  label: string;
  size?: number;
  onClick?: () => void;
}) {
  const state = STATE[status] ?? STATE.future;
  const { Icon } = state;
  const interactive = Boolean(onClick);

  const content = (
    <>
      {Icon ? (
        <Icon size={Math.round(size * 0.42)} aria-hidden="true" />
      ) : (
        <span aria-hidden="true" className="text-xs">
          —
        </span>
      )}
      <span className="sr-only">{`${label} — ${state.word.toLowerCase()}`}</span>
    </>
  );

  const cls = `flex items-center justify-center rounded-xl border shrink-0 ${state.cls} ${
    interactive
      ? "cursor-pointer transition-transform duration-fast ease-out hover:-translate-y-0.5 hover:shadow-md"
      : ""
  }`;

  if (!interactive) {
    return (
      <div className={cls} style={{ width: size, height: size }}>
        {content}
      </div>
    );
  }

  return (
    <button type="button" onClick={onClick} className={cls} style={{ width: size, height: size }}>
      {content}
    </button>
  );
}
