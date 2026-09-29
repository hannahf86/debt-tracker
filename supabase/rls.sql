-- Row-level security for the debt-tracker tables.
--

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
