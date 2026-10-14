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

## Still to decide

- **Existing testers.** The FAQ promises "free while it's in development". Recommendation: free
  permanently for anyone who joined during testing. It costs almost nothing and buys the kind of
  goodwill people talk about.
- **How a payment is taken** — Stripe Checkout is the least work and holds no card details on our
  side. Needs deciding before any of this is built.
- **How "paid until" is stored.** Probably a date on the user, checked server-side. It must be
  checked in `pages/api`, not in the browser, or it's a suggestion rather than a limit.
- **What happens to someone mid-month who pays late.** Simplest honest answer: the paid period runs
  from the day they pay, not from when the last one lapsed. Never bill for the gap.

## Not this

- No card details stored by Mirian, ever.
- No automatic renewal, no "we'll remind you by taking the money".
- No feature that makes someone's own data harder to reach because they haven't paid.
- No charging more to people with more debts.
