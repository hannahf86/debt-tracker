export type Debt = {
  id: string;
  user_id: string;
  name: string;
  company: string;
  amount_owed: number;
  total_amount: number;
  monthly_amount: number | null;
  category: "credit-card" | "loan" | "utilities" | "tax" | "other";
  arrangement:
    | "payment-plan"
    | "needs-setting-up"
    | "awaiting-response"
    | "account-in-default"
    | null;
  direct_debit_date: number | null;
  account_reference: string | null;
  company_email: string | null;
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
  created_at: string;
};

export type User = {
  id: string;
  email: string;
  monthly_budget: number | null;
  created_at: string;
  updated_at: string;
};
