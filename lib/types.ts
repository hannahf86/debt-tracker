// Database types for Supabase

export type Debt = {
  id: string
  user_id: string
  name: string
  company: string
  amount_owed: number
  total_amount: number
  category: 'credit-card' | 'loan' | 'utilities' | 'tax' | 'other'
  direct_debit_date: number | null
  account_reference: string | null
  company_email: string | null
  status: 'on-track' | 'payment-plan' | 'awaiting-response' | 'overdue' | 'resolved'
  created_at: string
  updated_at: string
}

export type Payment = {
  id: string
  debt_id: string
  amount: number
  payment_date: string
  created_at: string
}

export type User = {
  id: string
  email: string
  monthly_budget: number | null
  created_at: string
  updated_at: string
}
