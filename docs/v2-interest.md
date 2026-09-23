# v2 idea: interest

Status: **parked, not started.** Noted 2026-09-23, from Hannah: "we're missing interest — a percentage,
and what the actual payment is, so the app works it out after each payment and updates."

## What it is

Each debt gets an interest rate. After every payment, Mirian shows where the money actually went:

> You paid £50. £12.40 went on interest. £37.60 came off what you owe.

That split is the point. A payment that looks like £50 off a £1,200 card isn't £50 off, and not knowing
that is how people conclude they're bad with money when the arithmetic was never in their favour.

## Data

On `debts`:

```
interest_state     text     -- 'frozen' (default) | 'charged'
interest_rate      numeric  -- APR as a percentage, e.g. 24.9; required when charged
```

A state rather than a boolean, so "nobody has said" and "interest is stopped" don't end up looking the
same in the data later.

On `payments`, worked out when the payment is saved and then stored, never recalculated:

```
interest_applied   numeric
principal_applied  numeric
balance_after      numeric
```

Storing the split matters. A later change to the rate must not silently rewrite last year's history,
and the "record you can hand over" feature needs figures that don't move.

## The sums

Monthly rate from APR: `r = (1 + APR/100) ^ (1/12) - 1`. Interest for the period since the last payment:
`balance * r * (days / days_in_month)`. Then `new_balance = balance + interest - payment`.

This is an estimate. Real creditors compound daily, charge on their own statement date, and may add
fees. Mirian's figure will not match the statement to the penny and must never claim to.

## Rules that already exist and must not break

- **Backfilled payments never move `amount_owed`** ([[debt-tracker-security]]). Interest has to follow the
  same rule: a payment logged for a past month records its split but doesn't touch today's balance.
- The debt-free date comes from the projection. Once interest exists, the projection has to include it,
  or every date on the app becomes optimistic — worse than showing nothing.

## The case that needs the most care

If a payment is smaller than the month's interest, the balance goes **up**. This is common, it is not the
user's fault, and it is exactly the moment the app must not turn into every other debt app. No red, no
warning triangle, no "you're going backwards". Something closer to:

> At £25 a month this isn't coming down yet — the interest is £31. It's worth asking them to freeze it;
> here's a message you could send.

which hands them the next step instead of a verdict. The existing creditor-message templates already do
that job, so this can lead into them.

## Decided (Hannah, 2026-09-23)

1. **Interest defaults to frozen**, so the common case needs no setup — **but it must be visible, not
   silent.** Every debt states where it stands in plain words, as a quiet line, not a warning:
   *"No interest is being added to this one. Change this"*. Someone who does get charged interest can
   then see that the app has it wrong, instead of finding out from a balance that won't come down.
   - Where: on the debt's own page, and in the same "needs a few more details" nudge the app already
     shows (`lib/completeness.ts` → `missingDetails`).
   - Once a debt is set to charged, a missing rate counts as **`blocksTracking: true`**, the same as a
     missing payment date: without it the debt-free date can't be right.
2. **The debt-free date includes interest.** Agreed — otherwise every date in the app is optimistic.
3. **A gentle heads-up when the payment won't cover the interest.** Agreed, and where it goes matters:
   at the point of confirming the amount in `components/LogPaymentModal.tsx`, not afterwards.

## The heads-up, in detail

Shown only when the debt is set to charged, has a rate, and the amount entered is below the interest for
the period. Never blocks the payment — the payment is still logged exactly as entered, because what
happened is what gets recorded.

> **Worth knowing before you log this**
> At £25, this month's interest of £31 is more than the payment, so the balance won't come down yet.
> That's not a failure of yours — it's what the rate is doing.
> Lots of people ask their creditor to freeze interest, and many say yes.
>
> [Help me ask them]   [Log the payment anyway]

- "Help me ask them" opens the existing creditor-message templates (`lib/templates.ts`,
  `components/ContactModal.tsx`) — a freeze-interest template would need writing.
- "Log the payment anyway" is the plain continue. Neither button is styled as the wrong choice.
- No red, no warning triangle, no exclamation mark. Amber at most, matching the missed-month treatment.
- It appears once per payment, at confirmation. It never appears on the dashboard, and it never appears
  again unprompted afterwards.

## Still to decide

- **Where does the rate come from?** Assumed: a number the user types from their statement. Not looked
  up, not guessed from the creditor.
- **Show the split on every payment, or only in the debt's history?** Suggested: on the confirmation
  after logging a payment, and in the debt's own timeline. Not on the dashboard — that stays calm.

## Not this

- No fees, charges, or penalty interest modelling.
- No advice about whether to pay this debt before that one. That's regulated territory, and the app's
  line has always been "examples, not advice".
- No claim that Mirian's figure is the creditor's figure.
