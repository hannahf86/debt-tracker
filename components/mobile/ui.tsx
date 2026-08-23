import {
  CreditCard,
  Landmark,
  Zap,
  Receipt,
  Home,
  MoreHorizontal,
} from "lucide-react";

/** Shared mobile primitives. Kept here so they don't drift between screens. */

export const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const CATEGORY_ICON: Record<string, typeof CreditCard> = {
  "credit-card": CreditCard,
  loan: Landmark,
  utilities: Zap,
  tax: Receipt,
  household: Home,
  other: MoreHorizontal,
};

export function CategoryTile({
  category,
  size = 40,
}: {
  category: string;
  size?: number;
}) {
  const Icon = CATEGORY_ICON[category] ?? MoreHorizontal;
  return (
    <span
      className="flex items-center justify-center rounded-md bg-teal-50 text-brand shrink-0"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Icon size={Math.round(size * 0.5)} />
    </span>
  );
}

export function ProgressBar({
  percent,
  height = 8,
  label,
}: {
  percent: number;
  height?: number;
  /** Becomes the accessible name — never leave a bar unlabelled. */
  label: string;
}) {
  return (
    <div
      className="w-full bg-teal-100 rounded-pill overflow-hidden"
      style={{ height }}
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className="progress-bar h-full rounded-pill"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

export function percentPaid(total: number, owed: number) {
  return total > 0 ? Math.round(((total - owed) / total) * 100) : 0;
}

export const money = (n: number) => `£${Math.round(n).toLocaleString()}`;
