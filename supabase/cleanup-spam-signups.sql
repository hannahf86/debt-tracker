-- Clearing out the signup spam of September–October 2026.
--
-- What happened: with public signup open, a script submitted other people's
-- email addresses — .gov, .edu, company and T-Mobile SMS-gateway addresses —
-- so that Mirian's confirmation emails landed on strangers. The accounts
-- themselves are inert (nobody clicked the links, so none was ever confirmed),
-- but we are holding a list of addresses belonging to people who never asked
-- for anything. They should not sit in the database.
--
-- Signup must be turned OFF in the dashboard first, or this is sweeping a
-- floor while the tap runs:
--   Authentication → Sign In / Providers → Email → Allow new users to sign up
--
-- An unconfirmed account can never have signed in, so it owns no debts, no
-- payments and no profile row. Deleting these leaves nothing orphaned.

-- 1. Look before leaping. Read-only. ---------------------------------------

select
  count(*) filter (where email_confirmed_at is null) as unconfirmed,
  count(*) filter (where email_confirmed_at is not null) as confirmed,
  min(created_at) as earliest,
  max(created_at) as latest
from auth.users;

-- 2. Who would go? Read-only. The confirmed accounts — yours, and any real
--    tester — are not in this list.

select email, created_at
from auth.users
where email_confirmed_at is null
order by created_at desc
limit 100;

-- 3. Delete them. Only once step 2 shows what you expect.
--
-- delete from auth.users
-- where email_confirmed_at is null;

-- 4. Check nothing was left behind. Read-only; all three should be 0.
--
-- select
--   (select count(*) from public.debts d
--      where not exists (select 1 from auth.users u where u.id = d.user_id)) as orphan_debts,
--   (select count(*) from public.users p
--      where not exists (select 1 from auth.users u where u.id = p.id)) as orphan_profiles,
--   (select count(*) from public.contact_log c
--      where not exists (select 1 from public.debts d where d.id = c.debt_id)) as orphan_contacts;
