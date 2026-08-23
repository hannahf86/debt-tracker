import { ordinal } from "@/lib/format";

/**
 * Direct debit due dates.
 *
 * A bare day-of-month ("the 2nd") still makes you work out how far away that is.
 * These helpers give the countdown too, so the card can say it outright.
 */

/** The next occurrence of a day-of-month, clamped to short months. */
export function nextDueDate(
  dayOfMonth: number | null,
  from: Date = new Date(),
): Date | null {
  if (!dayOfMonth || dayOfMonth < 1 || dayOfMonth > 31) return null;

  const dayIn = (year: number, month: number) =>
    Math.min(dayOfMonth, new Date(year, month + 1, 0).getDate());

  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const thisMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    dayIn(today.getFullYear(), today.getMonth()),
  );

  if (thisMonth >= today) return thisMonth;

  const y = today.getMonth() === 11 ? today.getFullYear() + 1 : today.getFullYear();
  const m = (today.getMonth() + 1) % 12;
  return new Date(y, m, dayIn(y, m));
}

/** Whole days between two dates, ignoring the time of day. */
export function daysUntil(date: Date, from: Date = new Date()): number {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const b = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

export type DueInfo = {
  /** "Due 2nd" */
  label: string;
  /** "today" | "tomorrow" | "in 3 days" */
  relative: string;
  days: number;
  /** Due within the next 5 days — worth drawing the eye to. */
  imminent: boolean;
};

export function describeDue(
  dayOfMonth: number | null,
  from: Date = new Date(),
): DueInfo | null {
  const date = nextDueDate(dayOfMonth, from);
  if (!date) return null;

  const days = daysUntil(date, from);
  const relative =
    days === 0 ? "today" : days === 1 ? "tomorrow" : `in ${days} days`;

  return {
    label: `Due ${ordinal(date.getDate())}`,
    relative,
    days,
    imminent: days <= 5,
  };
}
