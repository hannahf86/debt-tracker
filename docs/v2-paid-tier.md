# Paid tier

Status: **decided in principle, not built.** Written 2026-10-14 from Hannah's decisions.

## The shape

**90 days free, everything included. Then £5 a month, paid only if the person chooses to.**

No card at signup. Nothing is ever taken automatically. When the free period ends the service
stops until they decide to pay — it does not quietly start charging.

That last part is the point of the whole design, not a detail. A lot of this app's users have been
caught by a subscription that renewed while they weren't looking. Mirian cannot be one of those and
still claim to be on their side.

### Why time, not a debt limit

A free tier capped at three debts was considered and rejected. The person who hits that cap is the
person with four or more debts — which is precisely who Mirian is for. It would charge people for
being in deeper trouble, and it would land the paywall at the moment someone is typing in the fourth
thing they owe money on, which is already the worst minute of their week.

It also breaks the central promise: a debt-free date calculated from three of someone's seven debts
isn't a debt-free date, it's a wrong number.

### Why 90 days and not 60

The value arrives slowly. Two months in, somebody has logged two payments and the date hasn't moved
much. Three months is roughly when the year on screen starts to look like theirs, which is the thing
they'd be paying for.

## What "stops" means

**Read-only, not locked out.** They keep seeing everything — the history, the debt-free date, the
year filling in — and simply can't log new payments until they pay.

A hard wall takes someone's record of their own progress away mid-repayment, which for this audience
is the thing keeping them going. It is also worse commercially: someone looking at what they'd lose
is likelier to pay than someone staring at a login form with no memory of what was behind it.

### What must keep working even unpaid

Not negotiable — the first two are law, not courtesy:

- **Signing in.**
- **The data export** (`/settings/data`, both PDF and JSON) and **account deletion**. Under UK GDPR
  the right to a copy of your own data doesn't lapse because an invoice wasn't paid. Putting either
  behind the paywall would be a breach.
- **The privacy notice**, which is public anyway.

### Retention if they never come back

Holding somebody's debt history forever, for a service they've stopped using, has no lawful basis.
Proposed: **keep it for 12 months after the free period ends, email before deleting, then delete.**
This needs to go in the privacy notice and the ROPA.

## Money

At £5/month, roughly **£4.70–£4.75** arrives, depending on the route:

| Route | Fee on £5 | Net |
| --- | --- | --- |
| Stripe, UK card | ~1.5% + 20p, plus ~0.5% Billing | ~£4.70 |
| GoCardless, Direct Debit | 1% + 20p | ~£4.75 |

Check both before committing; published rates move.

The fixed 20p is 4% of a £5 charge — the small amount is what hurts, not the percentage. Annual
billing at £50 would cost about 95p a year in fees instead of about £3.60. Worth offering later, but
**an annual charge must be opt-in and obvious**, or it becomes the trap this whole design avoids.

Direct Debit is a poor fit despite the slightly better rate: it is by nature automatic, which is the
thing being avoided.

## Tone

The end-of-trial screen is the most delicate copy in the app. It is read by someone in debt being
asked for money.

> **Your free three months are up**
> Everything you've logged is still here, and it stays here. You can look at it whenever you like.
> To start adding payments again, it's £5 a month — and it only ever charges when you say so.
>
> [Add payments again — £5/month] [Not now]

"Not now" must be a real option that leaves them somewhere useful, not a dead end.

## Decided (Hannah, 2026-10-14)

### Testers get it free, permanently

A `tester` role with free access for life. Twenty places, plus Hannah's own account
(`hannahmfeehan@gmail.com`) — 21 in total. Nobody should pay to use their own app, and the people who
put up with the rough edges shouldn't either.

**One thing to settle before this is built: how the role is granted.**

"The first 20 sign-ups" is the obvious reading, but September is the argument against it — a script
made dozens of accounts in a weekend. If the first twenty rows win the prize, the first twenty rows
could be bots, and the real testers arrive to find the places gone.

Two safer versions, either fine:

1. **Granted by hand.** Hannah sets the role in Supabase for each tester. At twenty people that is
   twenty clicks, once, and it cannot be gamed.
2. **Automatic, but only for invited accounts.** The role is granted on first sign-in if the account
   came from a Supabase invite and fewer than 20 exist. Bot-proof, because a public signup can never
   qualify — and it matches the invite-only round being run anyway.

Recommendation: (2) if the round stays invite-only, (1) if signups reopen first. Not (0) — a count
of rows in `auth.users`.

### Payment: Stripe Checkout

Hosted by Stripe, so no card details ever reach Mirian and the PCI surface stays theirs. One-off
payments rather than a Stripe subscription — a subscription object exists to renew itself, which is
the thing being avoided.

### Where entitlement lives

On the profile row in `public.users`, which already exists:

```
role        text not null default 'user'   -- 'user' | 'tester'
paid_until  date                           -- null until they first pay
trial_ends  date                           -- set at signup, 90 days out
```

Three rules, all applied **server-side in `pages/api`**, never in the browser:

```
free       = role = 'tester'
in trial   = today <= trial_ends
paid       = paid_until is not null and today <= paid_until
can write  = free or in trial or paid
```

A check in the browser is a suggestion; the browser is the attacker's computer. The gate belongs in
the handlers that write — `/api/payments` and `/api/debts` — and nowhere else, because reads,
exports and deletion stay open to everyone (see above, that part is law).

The UI should of course *also* know, so it can show the right thing rather than letting someone fill
in a form that gets refused. But the UI knowing is a courtesy; the API knowing is the limit.

### Paying late

The paid period runs from the day the payment is made, never from when the last one lapsed. Nobody
is billed for a gap in which they got nothing. `paid_until = max(today, paid_until) + 1 month`.

## Still to decide

- **Existing testers' promise.** The FAQ currently says "free while it's in development" — that
  wording should be made to match the tester role before anyone reads it as a promise about price.

## Not this

- No card details stored by Mirian, ever.
- No automatic renewal, no "we'll remind you by taking the money".
- No feature that makes someone's own data harder to reach because they haven't paid.
- No charging more to people with more debts.
