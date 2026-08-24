-- Orphaned payment rows, and the foreign keys behind them.
--
-- DELETE /api/debts/[id] used to remove the debt and leave its payments and
-- missed_payments behind. That is fixed in the route now, but rows orphaned by
-- earlier deletions are still sitting in the database. Nothing reads them —
-- every query joins from a debt the caller owns — so this is tidying, not a
-- leak. Run it in the Supabase SQL editor.

-- 1. How many are there? Read-only.
select 'payments' as table_name, count(*) as orphaned
from public.payments p
where not exists (select 1 from public.debts d where d.id = p.debt_id)
union all
select 'missed_payments', count(*)
from public.missed_payments m
where not exists (select 1 from public.debts d where d.id = m.debt_id);

-- 2. Clear them out. Only run once step 1 shows a count you expect.
-- delete from public.payments p
-- where not exists (select 1 from public.debts d where d.id = p.debt_id);
--
-- delete from public.missed_payments m
-- where not exists (select 1 from public.debts d where d.id = m.debt_id);

-- 3. Optional belt-and-braces: does the database cascade on its own?
--    Read-only. delete_rule will be CASCADE or NO ACTION for each key.
select
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  rc.delete_rule
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu
  on kcu.constraint_name = tc.constraint_name
join information_schema.referential_constraints rc
  on rc.constraint_name = tc.constraint_name
where tc.constraint_type = 'FOREIGN KEY'
  and tc.table_schema = 'public'
  and tc.table_name in ('payments', 'missed_payments')
order by tc.table_name;

-- If delete_rule is NO ACTION and you want the database to enforce it too,
-- fill in the constraint_name from the query above:
--
--   alter table public.payments
--     drop constraint <constraint_name>,
--     add  constraint <constraint_name>
--       foreign key (debt_id) references public.debts(id) on delete cascade;
--
-- Not required — the route deletes children explicitly either way.
