-- The free period, the paid period, and who never pays.
--
-- Run once in the Supabase SQL editor. Safe to run again.
--
-- See docs/v2-paid-tier.md for why it's shaped this way. In short: 90 days
-- free, then £5 a month paid only when somebody chooses to, and running out
-- means read-only rather than locked out.

-- 1. Three fields on the profile row -------------------------------------

alter table public.users
  add column if not exists role text not null default 'user',
  add column if not exists trial_ends date,
  add column if not exists paid_until date;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'users_role_check'
  ) then
    alter table public.users
      add constraint users_role_check check (role in ('user', 'tester'));
  end if;
end $$;

-- 2. Testers: free for life ----------------------------------------------
--
-- Invited accounts only. "The first 20 sign-ups" would have handed the places
-- to the bots that made dozens of accounts in September. Supabase stamps
-- invited_at on an invited account and leaves it null on a self-signup.
--
-- Hannah's own account predates the invites, so it's named here.

insert into public.users (id)
select a.id from auth.users a
where a.invited_at is not null
  and not exists (select 1 from public.users u where u.id = a.id)
on conflict (id) do nothing;

update public.users u
set role = 'tester'
from auth.users a
where a.id = u.id
  and u.role = 'user'
  and (
    a.invited_at is not null
    or a.email in ('hannahmfeehan@gmail.com', 'client@jorvikweb.dev')
  )
  and (select count(*) from public.users where role = 'tester') < 21;

-- 3. Who's what ----------------------------------------------------------
-- Read-only. Run it to see where everyone stands.

select
  a.email,
  coalesce(u.role, 'user') as role,
  u.trial_ends,
  u.paid_until,
  a.invited_at is not null as was_invited
from auth.users a
left join public.users u on u.id = a.id
order by a.created_at;

-- Note: trial_ends is left null here on purpose. The app fills it in the
-- first time someone is checked, from the date their account was created,
-- so there's no guesswork about when a trial that nobody was running began.

notify pgrst, 'reload schema';
