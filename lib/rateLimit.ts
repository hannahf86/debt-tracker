import type { NextApiRequest } from "next";

/**
 * A plain per-key rate limit, and the caller's IP.
 *
 * Held in memory, which on serverless means per instance and gone when the
 * instance recycles. It slows a crude script a great deal and a determined,
 * distributed one not at all. That is the honest limit of it: the real wall
 * for the auth routes is signup being closed, and this sits underneath.
 *
 * Shared by the public forms and the auth routes so there is one copy of the
 * logic rather than a second that drifts.
 */

type Hits = number[];

const buckets = new Map<string, Hits>();

/**
 * Record an attempt. True means this one is over the limit.
 *
 * The attempt counts whether or not it's allowed, so hammering the endpoint
 * keeps the door shut rather than resetting the count.
 */
export function overLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  hits.push(now);
  buckets.set(key, hits);

  // Don't let the map grow without bound on a long-lived instance.
  if (buckets.size > 1000) {
    for (const [k, times] of buckets) {
      if (times.every((t) => now - t >= windowMs)) buckets.delete(k);
    }
  }

  return hits.length > limit;
}

/** The caller's address, as far as the platform will tell us. */
export function clientIp(req: NextApiRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  const first = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return (first?.split(",")[0] ?? req.socket.remoteAddress ?? "unknown").trim();
}

/**
 * Throwaway mailbox providers. Not a moral judgement — someone using one to
 * sign up isn't here to track their debts, and every one of these addresses
 * costs a real email send from a real sending reputation.
 */
const DISPOSABLE = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamail.info",
  "sharklasers.com",
  "10minutemail.com",
  "temp-mail.org",
  "tempmail.com",
  "throwawaymail.com",
  "yopmail.com",
  "trashmail.com",
  "getnada.com",
  "dispostable.com",
  "maildrop.cc",
  "fakeinbox.com",
  "mailnesia.com",
  "spam4.me",
  "mohmal.com",
  "emailondeck.com",
  "tempr.email",
  "moakt.com",
]);

export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase().trim();
  return domain ? DISPOSABLE.has(domain) : false;
}

/**
 * The two checks a bot fails and a person never notices: a field hidden from
 * people, and the fact that a script fills a form faster than anyone can read
 * it. `startedAt` is when the form was opened, in milliseconds.
 */
export function looksAutomated(
  honeypot: unknown,
  startedAt: unknown,
  minSeconds = 3,
): boolean {
  if (typeof honeypot === "string" && honeypot.trim() !== "") return true;

  const started = Number(startedAt);
  if (!Number.isFinite(started) || started <= 0) return false; // not sent: don't punish
  const seconds = (Date.now() - started) / 1000;
  // A clock skewed into the future is as suspect as an instant submission.
  return seconds < minSeconds || seconds < 0;
}
