# Reminders

Status: **specced, not built.** Written 2026-10-19, from Hannah's ask for a weekly nudge and the
problem with building one as asked.

## The problem with the obvious version

A weekly "remember to log in and update your debts" email is, structurally, the most PDA-hostile
thing this app could ship. It is a recurring demand, from an authority, carrying an implied failure
if you don't comply. The homepage says it out loud: the harder an app pushes "pay now", the more
surely it gets ignored.

It is also wrong most of the time. Debts are paid monthly. A weekly reminder has nothing true to say
three weeks in four, and an email people learn to delete unread is its own small demand.

So: not weekly, not generic, and not instructions.

## What to build instead

### Anchored to real dates, not a calendar cadence

Every debt already stores `direct_debit_date`. The useful trigger is **two days after a debt's own
payment date, when nothing has been logged for that month**. That is specific, it is true, and it
arrives when there is genuinely something to record.

One email per person per run, however many debts it covers. Never one per debt.

### Information, not instruction

The whole game is here. Describe; don't direct. No imperatives, no exclamation marks, no "don't
forget", no "make sure you".

Not this:

> Don't forget to log your payments this week!

This:

> Your debt-free date is still 12 March 2029.
>
> Barclaycard's payment date was the 15th. Nothing's logged against it yet, which is fine. It's here
> whenever you want it.
>
> [Log that payment] [Not now] [Stop these emails]

Three properties of that version: it states facts, it offers rather than tells, and "Not now" is a
real option that leads somewhere pleasant rather than a dead end.

### Theirs to control

- **Off by default.** Chosen in settings, never assumed. Nobody should discover they've been signed
  up to being chased.
- **They pick the frequency**: per payment date (the recommended one), monthly, or never. Picking
  "never" is a legitimate answer and should look like one, not like a warning.
- **They pick the day and rough time** if they choose a fixed cadence. Nothing defaults to Monday
  morning, which for a lot of people is the worst moment to be handed anything task-shaped.
- **One click to stop, from inside the email, with no login.** A signed token in the URL, not a
  session. The off switch is as prominent as everything else in the email, not grey six-point type
  at the bottom.

### Never

- **No counting.** "It's been 3 weeks since you last logged in" is a streak in a disguise.
- **No implied failure.** Never "you missed", never "you're behind", never "still outstanding". A
  month with nothing logged might mean they paid and didn't record it, couldn't pay, or didn't want
  to look. None of those is ours to judge.
- **No totals in the subject line.** "You owe £7,771" landing on a lock screen in front of whoever
  else can see the phone is a small act of violence.
- **Nothing that renders as a to-do list.**

## Shares a home with the creditor nudge

The roadmap already promises "a nudge when it's time to chase" — a reminder when a creditor message
has gone unanswered. **That and this are the same feature wearing two hats**, and they must share
one preferences screen and one send path. Two separate email settings, each with its own switch,
is how someone ends up turning one off and still getting the other, and concluding they can't make
it stop.

One screen: **Email** in settings. Two switches. One unsubscribe that honours both.

## Shape of it

```
user_email_prefs (or columns on public.users)
  payment_reminders   text  -- 'off' (default) | 'due_dates' | 'monthly'
  reminder_day        int   -- 1-28, when 'monthly'
  creditor_nudges     bool  -- default false
  unsubscribe_token   uuid  -- for the no-login off switch
```

- **Sending**: Vercel cron, once a day, early afternoon UK time. Resend for the send, same as the
  contact form. `lib/siteMail.ts` already exists.
- **Idempotency matters.** Record what was sent and when, so a cron that runs twice doesn't email
  twice. A `reminders_sent` row per person per period is enough.
- **The data stays out of the email body** beyond what's needed: a company name, a date, the
  debt-free date. No balances, no totals, no amounts owed. Email is not a private channel.
- **Rate limit per person** regardless of configuration: never more than one reminder email a week,
  whatever the settings say, as a backstop against a bug becoming harassment.

## Legal

- Opt-in makes the PECR question easy. Keep it that way: no pre-ticked boxes, no "by signing up you
  agree".
- The privacy notice needs a line about reminder emails, what triggers them, and how to stop them.
- The unsubscribe link must work for the life of the account, including after someone stops paying.

## Decided (Hannah, 2026-10-19)

- **"Log that payment" opens a prefilled form.** It removes the "go and find the thing" step, which
  is usually the real barrier rather than forgetting.
  **The link must never perform the action.** In September, corporate mail scanners auto-clicked the
  confirmation links in Mirian's signup emails, which is how those spam accounts ended up confirmed
  and apparently signed in. A link that logged a payment directly would have scanners logging
  payments for people. Signed token, short-lived, opens a form, needs a tap to save.
- **The first email leads with the win, then offers one thing.** "Your debt-free day is 12 March
  2029" is a fact that reads as a gift. Then *one* feature, chosen for where that person is, not a
  list: a list of features in an email is homework, and homework is a demand.
- **A quiet month triggers nothing.** Somebody who hasn't logged in for two months may be avoiding
  it, and an email is the last thing that helps. The answer to being forgotten is not a nag; it's
  something that arrives in the post because they did something good. See [[v2-rewards]].

## Still open

- **What exactly does the first one say?** Worth writing by hand rather than generating. The first
  reminder somebody ever receives sets the tone for every one after it.
