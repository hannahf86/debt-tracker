# v2 idea: overdraft split balance

Status: **parked for version 2**. Not started. Noted 2026-09-15.

## The problem

A banking app shows one figure, e.g. "£1000". Half of it might be borrowed overdraft. Because the
number looks fine, it doesn't raise the alarm it should, and money gets spent that isn't yours.
The fix isn't budgeting advice. It's showing honest, separate numbers.

## Scope (manual entry only)

- The user types in and updates their own figures.
- No open banking (Plaid, TrueLayer, GoCardless bank feeds), no automatic syncing.
- No multi-currency.
- No interest or credit score maths on the overdraft. That belongs to debts.

## Data model

A new `accounts` table, separate from `debts`. An overdraft is a buffer that goes up and down. It
isn't paid off on a schedule, so it gets no "debt free by" date.

```
accounts {
  id                         uuid
  user_id                    same type as debts.user_id
  name                       text      -- "Monzo current account"
  overdraft_limit            numeric   -- 0 if no overdraft
  current_displayed_balance  numeric   -- updated by hand
  last_updated_at            timestamptz
  created_at                 timestamptz
}
```

Worked out on read, never stored:

```
if balance >= 0:  yours = balance,   overdraft_used = 0
else:             yours = 0,         overdraft_used = min(limit, |balance|)
buffer_left = limit - overdraft_used
```

This assumes a negative balance means overdrawn. Some banks show a positive figure that includes
the overdraft instead. Open question 1 decides which to go with.

## UI

1. **Set up / edit.** Name, overdraft limit (optional, defaults to £0), current balance. Plain
   help text, no banking jargon, no "danger zone", no red, no warning icons.
2. **Balance card.** Two figures, never one combined number:
   - "Yours to spend"
   - "Overdraft used" (only when above 0)
   - A horizontal bar split into "yours" and "borrowed", because proportion lands better than digits.
     Teal for yours, peach (`warn` tokens) for borrowed.
3. **Quick update.** One number field for the balance, since the limit rarely changes. It should take
   about 5 seconds. An optional gentle reminder, never guilt-based.
4. **Placement.** A card at the top of the dashboard, above the debts, because it answers "what can
   I actually spend right now?" first. It stays a separate table from debts.

## Open questions (answer before building)

1. **Balance convention.** Does the user type the number exactly as their bank shows it, or do we
   ask for two plain numbers ("money that's yours" and "overdraft limit")?
   *Suggestion:* ask for both, "What does your bank app show?" plus "Is that a minus number?"
   as a yes/no toggle. Typing a minus sign is fiddly on phones, and a toggle removes the guesswork.
2. **One account or several?**
   *Suggestion:* build the table for several, but show one in the first release.
3. **Show "last updated"?**
   *Suggestion:* yes, e.g. "Updated 3 days ago". Say it neutrally, and don't grey the number out.

## Fit with the current codebase

- **Fonts are already right.** Atkinson Hyperlegible is the body font (`styles/tokens/typography.css`),
  with Nunito for headings. **Colours:** the brand teal is the `teal-*` tokens, and peach is `warn-*`.
  The tokens hold raw RGB numbers, so write `rgb(var(--teal-700))`. A bare `var(--teal-700)` shows
  nothing.
- **Access rules.** All reads and writes go through `pages/api` using `lib/supabaseAdmin.ts`, and
  every query needs `.eq("user_id", userId)`. RLS on, with no anon policies, the same as
  `supabase/rls.sql`.
- **GDPR.** Add `accounts` to `/api/users/export`, `lib/dataExportPdf.ts`, `/api/users/delete`
  (delete it explicitly and check the error), the privacy notice's list of what we hold, and the ROPA.
- **Editing.** Use an `EDITABLE_FIELDS` whitelist like the one in `pages/api/debts/[id].ts`.
- **Plans.** Decide whether this counts toward the free-tier limits.
