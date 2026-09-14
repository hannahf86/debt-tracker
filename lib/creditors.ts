import type { Creditor, CreditorCategory } from "@/lib/types";

/** The kinds of company in the directory, in the order the picker shows them. */
export const CREDITOR_CATEGORIES: { value: CreditorCategory; label: string }[] = [
  { value: "banks_credit_cards", label: "Bank or credit card" },
  { value: "energy", label: "Energy" },
  { value: "water", label: "Water" },
  { value: "phone_broadband", label: "Phone or broadband" },
  { value: "buy_now_pay_later", label: "Buy now, pay later" },
  { value: "council_tax", label: "Council tax" },
];

export function isCreditorCategory(value: string): value is CreditorCategory {
  return CREDITOR_CATEGORIES.some((c) => c.value === value);
}

export function categoryLabel(value: CreditorCategory): string {
  return CREDITOR_CATEGORIES.find((c) => c.value === value)?.label ?? "";
}

/**
 * "Open Monzo's help page". Council tax is run by each local council, so it
 * points at the GOV.UK guidance rather than a single company.
 */
export function helpPageLabel(creditor: Pick<Creditor, "name" | "category">): string {
  return creditor.category === "council_tax"
    ? "Open GOV.UK's council tax help"
    : `Open ${creditor.name}'s help page`;
}
