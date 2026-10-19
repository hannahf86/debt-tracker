-- One preference: whether a certificate shows the company and the amount.
--
-- Run once in the Supabase SQL editor. Safe to run again.
--
-- Default FALSE on purpose. A certificate saying "Barclaycard: gone, £3,240"
-- is lovely on a fridge and risky in a group chat, and some people are hiding
-- a debt from somebody who controls the money. The safe version is the one you
-- get without thinking about it; showing the detail is a deliberate choice.

alter table public.users
  add column if not exists certificate_show_details boolean not null default false;

notify pgrst, 'reload schema';
