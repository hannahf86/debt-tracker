-- Company directory: how to reach common UK creditors about difficulty paying.
--
-- Run once in the Supabase SQL editor. Safe to run again: it updates existing
-- companies rather than duplicating them.
--
-- Every entry was checked on the company's own website on its checked_on
-- date. Support pages move and emails change, so re-check them periodically.
-- Phone numbers are deliberately not stored: calling is the hardest route for
-- many neurodivergent people, so the app only offers written ways in.
--
-- ScottishPower is left out: its site blocked automated checks, so nothing
-- about it could be verified. Add it by hand once someone has looked.

create table if not exists public.creditors (
  id           bigint generated always as identity primary key,
  name         text not null,
  category     text not null check (category in (
                 'banks_credit_cards', 'energy', 'water',
                 'phone_broadband', 'buy_now_pay_later', 'council_tax')),
  support_url  text not null,
  email        text,
  -- other names people might search for ("eon" for E.ON Next)
  aliases      text,
  checked_on   date not null,
  is_active    boolean not null default true,
  -- what search matches against: lower case, punctuation removed
  search_key   text generated always as (
                 lower(regexp_replace(name || ' ' || coalesce(aliases, ''), '[^a-zA-Z0-9 ]', '', 'g'))
               ) stored,
  unique (name, category)
);

alter table public.creditors enable row level security;

-- A debt can be linked to a company in the directory. Optional, and removing
-- a company from the directory just unlinks it.
alter table public.debts
  add column if not exists creditor_id bigint
  references public.creditors(id) on delete set null;

insert into public.creditors (name, category, support_url, email, aliases, checked_on) values
  ('Barclaycard', 'banks_credit_cards', 'https://www.barclaycard.co.uk/personal/customer/money-worries', null, 'barclays card', '2026-09-14'),
  ('Barclays', 'banks_credit_cards', 'https://www.barclays.co.uk/money-management/managing-money-problems/', null, null, '2026-09-14'),
  ('Capital One UK', 'banks_credit_cards', 'https://www.capitalone.co.uk/support/support-with-your-finance-during-tough-times', null, null, '2026-09-14'),
  ('HSBC UK', 'banks_credit_cards', 'https://www.hsbc.co.uk/help/money-worries/', null, null, '2026-09-14'),
  ('Halifax', 'banks_credit_cards', 'https://www.halifax.co.uk/helpcentre/support-and-wellbeing/managing-your-money/money-worries/how-we-can-help.html', null, null, '2026-09-14'),
  ('Lloyds Bank', 'banks_credit_cards', 'https://www.lloydsbank.com/help-guidance/support-and-wellbeing/managing-your-money/money-worries/how-we-can-help.html', null, null, '2026-09-14'),
  ('Monzo', 'banks_credit_cards', 'https://monzo.com/money-worries', 'help@monzo.com', null, '2026-09-14'),
  ('NatWest', 'banks_credit_cards', 'https://www.natwest.com/life-moments/Struggling-financially.html', null, null, '2026-09-14'),
  ('Nationwide Building Society', 'banks_credit_cards', 'https://www.nationwide.co.uk/help/challenging-times/money-worries', null, null, '2026-09-14'),
  ('Santander UK', 'banks_credit_cards', 'https://www.santander.co.uk/personal/support/customer-support/money-worries', null, null, '2026-09-14'),
  ('Vanquis', 'banks_credit_cards', 'https://www.vanquis.com/help/support-and-wellbeing/money-worries/', null, null, '2026-09-14'),
  ('Clearpay', 'buy_now_pay_later', 'https://www.clearpay.co.uk/en-GB/hardship', null, 'afterpay', '2026-09-14'),
  ('Klarna', 'buy_now_pay_later', 'https://www.klarna.com/uk/help/additional-support/i-m-experiencing-financial-difficulties-what-support-is-available-to-me/', null, null, '2026-09-14'),
  ('PayPal (Pay in 3)', 'buy_now_pay_later', 'https://www.paypal.com/uk/cshelp/article/questions-about-pay-in-3-repayments---help1099', null, null, '2026-09-14'),
  ('Council Tax (your local council)', 'council_tax', 'https://www.gov.uk/council-tax-arrears', null, null, '2026-09-14'),
  ('British Gas', 'energy', 'https://www.britishgas.co.uk/help-and-support/struggling-to-pay', null, null, '2026-09-14'),
  ('E.ON Next', 'energy', 'https://www.eonnext.com/policies/struggling-to-pay', 'hi@eonnext.com', 'eon', '2026-09-14'),
  ('EDF', 'energy', 'https://www.edfenergy.com/help-support/energy-bill-debt-advice', 'hello@edfenergy.com', null, '2026-09-14'),
  ('OVO Energy', 'energy', 'https://www.ovoenergy.com/payment-support', null, null, '2026-09-14'),
  ('Octopus Energy', 'energy', 'https://octopus.energy/policies/having-difficulty-paying/', null, null, '2026-09-14'),
  ('BT', 'phone_broadband', 'https://www.bt.com/help/account-and-billing/can-i-have-more-time-to-pay-my-bill-', null, null, '2026-09-14'),
  ('EE', 'phone_broadband', 'https://ee.co.uk/help/billing-payments/payment-methods/what-should-i-do-if-i-cant-pay-my-bill', null, null, '2026-09-14'),
  ('O2', 'phone_broadband', 'https://www.o2.co.uk/help/account/billing-and-usage/payment-support', null, 'virgin media o2', '2026-09-14'),
  ('Sky', 'phone_broadband', 'https://www.sky.com/help/articles/support-with-financial-difficulty', null, null, '2026-09-14'),
  ('TalkTalk', 'phone_broadband', 'https://help-centre.talktalk.co.uk/Billing_and_Payments/Struggling_to_pay/Struggling_to_pay', null, null, '2026-09-14'),
  ('Three', 'phone_broadband', 'https://www.three.co.uk/support/bills-and-contracts/paying-your-bills/helping-you-pay-your-monthly-bill', null, null, '2026-09-14'),
  ('Virgin Media', 'phone_broadband', 'https://www.virginmedia.com/help/billing-and-payments/payment-issues', null, 'virgin media o2', '2026-09-14'),
  ('Vodafone UK', 'phone_broadband', 'https://www.vodafone.co.uk/help/bill-payment-support/missed-payments', null, null, '2026-09-14'),
  ('Anglian Water', 'water', 'https://www.anglianwater.co.uk/services/extra-support/help-paying-your-water-bill/help-if-youre-struggling-to-pay', null, null, '2026-09-14'),
  ('Severn Trent', 'water', 'https://www.stwater.co.uk/help-and-contact/help-with-paying-your-bill/', null, null, '2026-09-14'),
  ('Thames Water', 'water', 'https://www.thameswater.co.uk/help/account-and-billing/financial-support', null, null, '2026-09-14'),
  ('United Utilities', 'water', 'https://www.unitedutilities.com/my-account/your-bill/difficulty-paying-your-bill/', null, null, '2026-09-14'),
  ('Yorkshire Water', 'water', 'https://www.yorkshirewater.com/bill-account/help-paying-your-bill/', null, null, '2026-09-14')
on conflict (name, category) do update set
  support_url = excluded.support_url,
  email       = excluded.email,
  aliases     = excluded.aliases,
  checked_on  = excluded.checked_on;

-- Verify: a count per category, and rowsecurity = true.
select category, count(*) from public.creditors group by category order by category;
select tablename, rowsecurity from pg_tables where schemaname = 'public' and tablename = 'creditors';
