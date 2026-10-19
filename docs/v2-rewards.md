# Rewards: stickers, certificates and things that arrive in the post

Status: **idea, with one hard safeguard.** Written 2026-10-19 from Hannah's thinking.

## The problem it actually solves

Not motivation. Visibility.

"If an ND person can't see the app, they forget it exists." Email is the channel everyone has learned
to ignore, which is why reminders have to be so carefully written to be bearable at all
([[v2-reminders]]). Post is the channel nobody gets any more, which is exactly why it lands. An
envelope on the mat is a memory cue that no notification can match, and it carries no demand: it
doesn't ask for anything, it just says the thing happened.

It is also, frankly, a dopamine hit, and that is a legitimate design goal for this audience rather
than a guilty pleasure.

## The safeguard that comes before everything else

**Plain envelopes. Nothing on the outside. Ever.**

Some people using Mirian are hiding debt from a partner, and some of those partners are controlling
about money. An envelope marked "Mirian Debt Tracker" could out somebody to the person they are
hiding it from, and the consequences of that are not ours to risk. Financial abuse is common and
debt is one of the things most often concealed.

So: no branding, no return address naming the service, nothing visible through a window. And say so
plainly at the point of asking for an address, because the people who most need to know will be
scanning for exactly that reassurance.

If that cannot be guaranteed by whoever fulfils it, the physical version does not ship.

## What gets rewarded

Anchor to things that **certainly** happen, and happen early.

### The rule that makes this not a streak

Every award counts something that can only go up. Nothing resets, nothing is
lost, nothing can be failed:

- **Days since you started.** Elapsed time, not attendance.
- **Payments logged**, cumulative.
- **Months with something in them**, counted, never consecutive.

"100 days with Mirian" is a fact about being here. "100 day streak" is a thing
you can lose on day 101. Same numbers, opposite emotional contract, and only
one of them belongs in this app.

### The ladder

Starts in week one, because ADHD motivation falls off a cliff and the award
that matters most is the one arriving before the novelty wears off.

| When | What it says | Form |
| --- | --- | --- |
| First debt added | You started | certificate |
| First payment logged | One logged | certificate |
| 30 days | A month in | certificate |
| 60 days | Two months | certificate |
| 100 days | 100 days of showing up | **sticker** |
| 200 days | 200 days | certificate |
| 1 year | A year of this | **sticker** |
| 500 days | 500 days | certificate |
| 2 years | Two years | **sticker** |
| First debt cleared | [name]: gone | certificate, already built |
| Debt free | The big one | **trophy or pin** |

### Coming back

**Any payment logged after a month away.** Repeatable, every time, no limit.

Returning after a gap is the hardest single thing for a PDA or ADHD brain, and
nobody rewards it because every other app is busy punishing the gap. A reward
you earn *by* having faltered first is the precise opposite of a streak, and
it is probably the most important one on this page.

Never worded as though the gap needed excusing. "Back again" rather than
"welcome back, we missed you", which implies someone was being watched.

### The brave things

Not everything worth marking is about time or money.

| What they did | Why it counts |
| --- | --- |
| First message to a creditor | The frightening one, much harder than logging a number |
| Asked for interest to be frozen | Advocating for themselves, using the template |
| Filled in their year | Backfilled past months, which takes real effort |
| Set up an arrangement | Turned "needs setting up" into "in place" |

### Never reward amounts

No "£1,000 paid off" awards. Someone paying £20 a month would never qualify
while someone paying £300 collects the set, and the first person is likelier
to need the encouragement. Time and action are fair; money is not.

## How they're shown

**Only what has happened.** Never a locked or greyed-out award, never "3 more
days!". A page of unearned badges is a to-do list, and a to-do list is a
demand.

On a page somebody chooses to visit. No badge count on the dashboard, no dot
on a nav item, nothing that nags from the corner of the screen.

## Ship the free version first

`jspdf` is already in the app, for the data export. A printable certificate costs nothing, arrives
instantly, and answers the question that decides the rest: **do people care about this?**

If they print them, stick them on the fridge and post pictures, the postage is worth committing to.
If they don't, a lovely idea has cost an afternoon rather than a year of envelopes.

Start with "100 days of showing up", generated client-side, in the app's own type and colours.

## The money, roughly

| Thing | Cost delivered | In £5 subscriptions |
| --- | --- | --- |
| Printable certificate | nothing | — |
| Sticker sheet + 2nd class | ~£2 | about a fortnight |
| Small tracker book | ~£6 to £9 | one to two months |
| Trophy or enamel pin | ~£8 to £15 | two to three months |

Net on a £5 subscription is about £4.70 ([[v2-paid-tier]]). Affordable as a one-off at a milestone;
ruinous as a monthly habit. The tracker book on subscribing is the one to model carefully, because
it lands before anyone has paid for a second month.

Fulfilment is also Hannah's time. Twenty testers is an afternoon; five hundred users is a job.

## Data

A postal address is a new category of personal data for Mirian, which currently holds email and
debts only.

- **Optional, always.** An address field that looks required will stop people signing up, and the
  reward is worthless if obtaining it costs somebody their privacy.
- **Deleted after sending.** No reason to keep it. A retention line in the privacy notice and the
  ROPA.
- **Not stored with the debts.** Different purpose, different lawful basis, and it keeps a leak of
  one from being a leak of both.
- The ROPA, the privacy notice and the solicitor pass all need updating before the first envelope.

## Open questions

- **Who fulfils it?** A UK print-on-demand service that will post plain is the thing to find.
  Doing it by hand is fine at tester scale and becomes a trap at launch scale.
- **Is the tracker book a subscriber perk or a separate purchase?** As a perk it is a real cost
  before anyone has paid twice. As a £6 thing people can buy, it might even make money.
- **What happens to someone who stops paying mid-milestone?** Nothing. They keep what they earned,
  and the certificate still generates. Taking a reward away would be the single most off-brand thing
  this app could do.
