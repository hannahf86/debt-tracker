import type { Debt } from "@/lib/types";

/**
 * Which details a debt still needs to be tracked properly.
 *
 * These stay nullable in the database on purpose — you often won't have the
 * reference or the email to hand when you first add a debt, and blocking on
 * them would mean the debt never gets added at all. So they're recorded as
 * outstanding rather than enforced, and surfaced where they can be filled in
 * later.
 */

export type MissingDetail = {
  key: "direct_debit_date" | "account_reference" | "company_email";
  label: string;
  /** Without this the app can't do something it otherwise would. */
  blocksTracking: boolean;
};

export function missingDetails(debt: Debt): MissingDetail[] {
  const missing: MissingDetail[] = [];

  if (!debt.direct_debit_date) {
    missing.push({
      key: "direct_debit_date",
      label: "payment date",
      blocksTracking: true, // no due date means no countdown and no reminders
    });
  }
  if (!debt.account_reference?.trim()) {
    missing.push({
      key: "account_reference",
      label: "account reference",
      blocksTracking: false,
    });
  }
  if (!debt.company_email?.trim()) {
    missing.push({
      key: "company_email",
      label: "company email",
      blocksTracking: false,
    });
  }

  return missing;
}

export function isComplete(debt: Debt): boolean {
  return missingDetails(debt).length === 0;
}

/** Debts still missing something, most incomplete first. */
export function incompleteDebts(debts: Debt[]): Debt[] {
  return debts
    .filter((d) => !isComplete(d))
    .sort((a, b) => missingDetails(b).length - missingDetails(a).length);
}
