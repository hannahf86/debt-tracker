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

Anchor to things that **certainly** happen, and happen early. The debt-free date may be four years
out and it moves every time a payment lands, so a trophy for it is lovely and almost nobody collects
one this year.

| Milestone | Why it works |
| --- | --- |
| First payment logged | Happens in week one. The moment the app becomes a habit or doesn't. |
| 100 days of recording | Far enough to mean something, near enough to reach. |
| First debt cleared | The genuinely big one, and it happens to most people long before the last. |
| Debt free | The trophy. Rare, so it can be nicer. |

Nothing is ever taken away, and no milestone is ever missed — these are things that have happened,
not targets to hit. A reward you can fail to earn is a streak with better manners.

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
