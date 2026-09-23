export type Debt = {
  id: string;
  user_id: string;
  name: string;
  company: string;
  amount_owed: number;
  total_amount: number;
  monthly_amount: number | null;
  category:
    | "credit-card"
    | "loan"
    | "utilities"
    | "tax"
    | "household"
    | "other";
  arrangement:
    | "not-set"
    | "payment-plan"
    | "needs-setting-up"
    | "awaiting-response"
    | "account-in-default"
    | null;
  direct_debit_date: number | null;
  account_reference: string | null;
  company_email: string | null;
  /** Linked entry in the company directory, if they picked one. */
  creditor_id?: number | null;
  /**
   * Whether interest is being added. Frozen by default: most people on a
   * plan, a DMP or a default have it stopped, and assuming otherwise would
   * quietly inflate everybody's balance.
   */
  interest_state?: "frozen" | "charged" | null;
  /** APR as a percentage, e.g. 24.9. Only meaningful when charged. */
  interest_rate?: number | null;
  created_at: string;
  updated_at: string;
};

export type Payment = {
  id: string;
  debt_id: string;
  amount: number;
  expected_amount: number | null;
  payment_type: "on-time" | "late" | "partial" | "partial-late";
  payment_date: string;
  /**
   * Where the money went, worked out when the payment was logged and never
   * recalculated. Null on payments logged before interest existed, and on
   * debts with no interest — an honest gap beats an invented figure.
   */
  interest_applied?: number | null;
  principal_applied?: number | null;
  balance_after?: number | null;
  created_at: string;
};

export type User = {
  id: string;
  email: string;
  monthly_budget: number | null;
  created_at: string;
  updated_at: string;
};

export type ContactMethod = "email" | "copy" | "letter";

/** A message someone has sent a creditor, kept so they don't have to remember. */
export type ContactLog = {
  id: number | string;
  debt_id: string;
  template: string;
  method: ContactMethod;
  subject: string | null;
  body: string;
  sent_at: string;
};

export type CreditorCategory =
  | "banks_credit_cards"
  | "energy"
  | "water"
  | "phone_broadband"
  | "buy_now_pay_later"
  | "council_tax";

/** A company in the directory, and the written ways to reach them. */
export type Creditor = {
  id: number;
  name: string;
  category: CreditorCategory;
  support_url: string;
  email: string | null;
};
