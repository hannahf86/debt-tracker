import { sendSiteEmail, MailNotConfigured } from "@/lib/siteMail";
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * The website's contact and feedback forms.
 *
 * Public and unauthenticated, so it's defended without a CAPTCHA — which
 * would fall hardest on the people this app is for:
 *
 *   - a honeypot field no human sees, filled in only by bots
 *   - a minimum time on the page, since bots submit instantly
 *   - length caps on every field
 *   - a per-IP limit
 *
 * The per-IP limit is held in memory, so it resets when the serverless
 * instance does and isn't shared between instances. It slows a crude flood
 * rather than stopping a determined one. If spam ever becomes a real problem,
 * the next step is a shared store or Cloudflare Turnstile.
 *
 * Messages are emailed and not stored anywhere.
 */

const LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000;
const MIN_SECONDS_ON_PAGE = 3;

const MAX = { name: 100, email: 200, message: 5000 };
const MIN_MESSAGE = 4;

const FEEDBACK_TYPES: Record<string, string> = {
  bug: "Something's broken",
  feature: "Feature request",
  general: "General thoughts",
};

const recent = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  recent.set(ip, hits);

  // Don't let the map grow without bound on a long-lived instance.
  if (recent.size > 500) {
    for (const [key, times] of recent) {
      if (times.every((t) => now - t >= WINDOW_MS)) recent.delete(key);
    }
  }

  return hits.length > LIMIT;
}

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const looksLikeEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { form, name, email, message, type, website, startedAt } = req.body ?? {};

  // A bot filled the hidden field. Answer as if it worked, so it learns nothing.
  if (str(website)) return res.status(200).json({ ok: true });

  const seconds = (Date.now() - Number(startedAt ?? 0)) / 1000;
  if (!Number.isFinite(seconds) || seconds < MIN_SECONDS_ON_PAGE) {
    return res.status(200).json({ ok: true });
  }

  const forwarded = req.headers["x-forwarded-for"];
  const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded || "")
    .split(",")[0]
    .trim();
  if (ip && rateLimited(ip)) {
    return res.status(429).json({
      error: "That's a few messages in a short time. Please try again a bit later.",
    });
  }

  const isFeedback = form === "feedback";
  const theirName = str(name).slice(0, MAX.name);
  const theirEmail = str(email).slice(0, MAX.email);
  const body = str(message);

  if (body.length < MIN_MESSAGE || body.length > MAX.message) {
    return res.status(400).json({ error: "Please write a message first." });
  }
  // Contact needs a reply address; feedback is deliberately anonymous-friendly.
  if (!isFeedback && !looksLikeEmail(theirEmail)) {
    return res
      .status(400)
      .json({ error: "Please add an email address so we can reply." });
  }
  if (isFeedback && theirEmail && !looksLikeEmail(theirEmail)) {
    return res
      .status(400)
      .json({ error: "That email address doesn't look quite right." });
  }

  const label = isFeedback ? FEEDBACK_TYPES[str(type)] ?? "Feedback" : null;
  const subject = isFeedback
    ? `Mirian feedback: ${label}`
    : `Mirian: message from ${theirName || "the website"}`;

  const text = [
    body,
    "",
    "—",
    `From: ${theirName || "(no name given)"}`,
    `Email: ${theirEmail || "(none given)"}`,
    isFeedback ? `Type: ${label}` : null,
    `Sent from the ${isFeedback ? "feedback" : "contact"} form`,
  ]
    .filter((line) => line !== null)
    .join("\n");

  try {
    await sendSiteEmail({
      subject,
      text,
      replyTo: looksLikeEmail(theirEmail) ? theirEmail : undefined,
    });
    return res.status(200).json({ ok: true });
  } catch (error) {
    if (error instanceof MailNotConfigured) {
      console.error("Site form: RESEND_API_KEY is not set, message not sent.");
      return res.status(503).json({
        error: `Sorry — the form isn't working just now. Please email ${process.env.CONTACT_TO ?? "hello@jorvikweb.dev"} instead.`,
      });
    }
    console.error(
      "Site form failed:",
      error instanceof Error ? error.message : "unknown error",
    );
    return res.status(502).json({
      error: "We couldn't send that just now. Please try again in a moment.",
    });
  }
}
