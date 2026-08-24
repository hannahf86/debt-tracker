-- Row-level security for the debt-tracker tables.
--
-- Run this once in the Supabase SQL editor (Dashboard -> SQL Editor -> New query).
--
-- WHY THIS IS SAFE TO RUN:
--   NEXT_PUBLIC_SUPABASE_ANON_KEY is embedded in the browser bundle, so it is
--   public. With RLS disabled, anyone holding it can read every row in these
--   tables straight from the Supabase REST API, without ever touching the app's
--   API routes or its user_id filters.
--
--   Enabling RLS with no policies denies all access to anon and authenticated.
--   The app is unaffected, because every API route queries through the
--   service-role key (lib/supabaseAdmin.ts), and service_role bypasses RLS by
--   design. Per-user isolation is enforced by the user_id filters in pages/api.
--
--   Do NOT add permissive policies here to "make things work". If a query
--   breaks after this, it is because something is still reaching the database
--   with the anon key — fix that instead.

alter table public.users            enable row level security;
alter table public.debts            enable row level security;
alter table public.payments         enable row level security;
alter table public.missed_payments  enable row level security;

-- Verify: rowsecurity should be true for all four.
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('users', 'debts', 'payments', 'missed_payments')
order by tablename;
