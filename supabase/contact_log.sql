-- Contact history: messages someone has sent a creditor from the app.
--
-- Run this once in the Supabase SQL editor BEFORE deploying the code that
-- uses it. Until the table exists, the "Your contact history" list on each
-- debt shows a gentle "couldn't load" message, but nothing else breaks.
--
-- debt_id cascades, so deleting a debt (or an account, which deletes its
-- debts) removes its contact history with it. No route has to remember to.
--
-- The column types are read from public.debts rather than assumed, because
-- the id type there was set up in the dashboard and isn't in the repo.

do $$
declare
  debt_id_type text;
  user_id_type text;
begin
  select data_type into debt_id_type
  from information_schema.columns
  where table_schema = 'public' and table_name = 'debts' and column_name = 'id';

  select data_type into user_id_type
  from information_schema.columns
  where table_schema = 'public' and table_name = 'debts' and column_name = 'user_id';

  execute format($sql$
    create table if not exists public.contact_log (
      id         bigint generated always as identity primary key,
      user_id    %s not null,
      debt_id    %s not null references public.debts(id) on delete cascade,
      template   text not null,
      method     text not null check (method in ('email', 'copy', 'letter')),
      subject    text,
      body       text not null,
      sent_at    timestamptz not null default now()
    )
  $sql$, user_id_type, debt_id_type);
end $$;

create index if not exists contact_log_debt_sent_idx
  on public.contact_log (debt_id, sent_at desc);

-- Same rule as every other table: closed to the anon key, reached only
-- through the service role from pages/api.
alter table public.contact_log enable row level security;

-- Verify: should return one row with rowsecurity = true.
select tablename, rowsecurity
from pg_tables
where schemaname = 'public' and tablename = 'contact_log';
