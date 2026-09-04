-- ============================================================================
-- Lock the application tables down to the server.
--
-- WHY THIS IS NEEDED
--
-- Mirian signs users in through NextAuth, not Supabase Auth, so no Supabase
-- user JWT ever reaches Postgres. `auth.uid()` is always null for requests the
-- app makes, which means a per-user policy of the usual shape
--
--     using (auth.uid() = user_id)
--
-- can never match, and the app could only work while these tables stayed
-- readable by the `anon` role. The anon key is public — it is inlined into the
-- browser bundle and can be read from the deployed site — so in practice
-- anyone could query every user's debts, balances, payment history, creditor
-- references and hardship notes straight off the REST API, and write to them.
--
-- The application code now reads and writes through the service-role key
-- (lib/supabaseAdmin.ts), which bypasses RLS by design. That means `anon` and
-- `authenticated` no longer need any access at all, and the safest policy set
-- is an empty one: RLS on, no policies, nothing granted.
--
-- Run this in the Supabase SQL editor. It is safe to re-run.
-- ============================================================================

-- 1. Turn RLS on. With no policies attached, every non-service role gets zero
--    rows. `force` also subjects the tables' owner to it.
alter table public.debts            enable row level security;
alter table public.payments         enable row level security;
alter table public.missed_payments  enable row level security;
alter table public.users            enable row level security;

alter table public.debts            force row level security;
alter table public.payments         force row level security;
alter table public.missed_payments  force row level security;
alter table public.users            force row level security;

-- 2. Belt and braces: take away the table grants Supabase hands these roles by
--    default, so the public key cannot even attempt a read.
revoke all on public.debts           from anon, authenticated;
revoke all on public.payments        from anon, authenticated;
revoke all on public.missed_payments from anon, authenticated;
revoke all on public.users           from anon, authenticated;

-- Stop future tables in `public` from being granted to these roles by default.
alter default privileges in schema public revoke all on tables from anon, authenticated;

-- ============================================================================
-- VERIFY
--
-- (a) Every table below should report rls_enabled = true and policy_count = 0.
-- ============================================================================
select
  c.relname                as table_name,
  c.relrowsecurity         as rls_enabled,
  c.relforcerowsecurity    as rls_forced,
  count(p.polname)         as policy_count
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
left join pg_policy p on p.polrelid = c.oid
where n.nspname = 'public'
  and c.relname in ('debts', 'payments', 'missed_payments', 'users')
group by 1, 2, 3
order by 1;

-- (b) Should return no rows: neither public role retains any privilege.
select grantee, table_name, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('debts', 'payments', 'missed_payments', 'users')
  and grantee in ('anon', 'authenticated');

-- ============================================================================
-- AFTERWARDS
--
-- Confirm from outside the app that the public key is now inert. With the anon
-- key from the browser bundle:
--
--   curl "https://<project>.supabase.co/rest/v1/debts?select=*" \
--     -H "apikey: <anon key>"
--
-- Before this migration that returns rows. After it, it must return none.
--
-- NOTE: every API route is now the only thing scoping data to its owner — the
-- database will not catch a handler that forgets to filter on user_id. If you
-- later move authentication to Supabase Auth so a real user JWT reaches
-- Postgres, replace section 1 with per-user policies instead:
--
--   create policy "own debts" on public.debts
--     for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
--
--   -- payments have no user_id of their own; they hang off the debt
--   create policy "own payments" on public.payments
--     for all using (exists (
--       select 1 from public.debts d
--       where d.id = payments.debt_id and d.user_id = auth.uid()
--     ));
-- ============================================================================
