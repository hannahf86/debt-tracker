-- Interest: a rate per debt, and where each payment actually went.
--
-- Run this once in the Supabase SQL editor. Safe to run again: every
-- statement checks first.
--
-- Nothing changes for existing debts. They all start as 'frozen', which is
-- true for most people on a payment plan, a DMP, or a defaulted account, and
-- means no balance moves until someone says otherwise.

-- 1. The rate, on the debt ------------------------------------------------

alter table public.debts
  add column if not exists interest_state text not null default 'frozen',
  add column if not exists interest_rate numeric(6, 3);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'debts_interest_state_check'
  ) then
    alter table public.debts
      add constraint debts_interest_state_check
      check (interest_state in ('frozen', 'charged'));
  end if;

  -- A rate is a percentage. 0 to 200 is generous enough for a card, a
  -- doorstep loan, and anything short of a typo.
  if not exists (
    select 1 from pg_constraint where conname = 'debts_interest_rate_check'
  ) then
    alter table public.debts
      add constraint debts_interest_rate_check
      check (interest_rate is null or (interest_rate >= 0 and interest_rate <= 200));
  end if;
end $$;

-- 2. Where each payment went ---------------------------------------------
--
-- Worked out once, when the payment is logged, and then left alone. Changing
-- a rate next year must not rewrite what happened last year, and the record
-- someone hands to a creditor has to stay put.

alter table public.payments
  add column if not exists interest_applied numeric(12, 2),
  add column if not exists principal_applied numeric(12, 2),
  add column if not exists balance_after numeric(12, 2);

-- Existing payments keep null in all three: we genuinely don't know how they
-- split, and a made-up figure would be worse than an honest gap.
