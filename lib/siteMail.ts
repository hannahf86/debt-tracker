/**
 * Sends the website's contact and feedback messages by email, through Resend.
 *
 * Nothing is stored: the message is emailed and then gone. Resend is already
 * used for the app's sign-in emails, so this adds no new company to the
 * privacy notice — but it does need its own API key, because the sign-in
 * emails go through Supabase's SMTP settings rather than this app.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";

/** Who the site emails land with. */
export const CONTACT_TO = process.env.CONTACT_TO ?? "hello@jorvikweb.dev";

/** Must be an address on a domain verified in Resend. */
export const CONTACT_FROM = process.env.CONTACT_FROM ?? "Mirian <hello@jorvikweb.dev>";

export class MailNotConfigured extends Error {}

export async function sendSiteEmail({
  subject,
  text,
  replyTo,
}: {
  subject: string;
  text: string;
  replyTo?: string;
}) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new MailNotConfigured("RESEND_API_KEY is not set");

  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: CONTACT_FROM,
      to: [CONTACT_TO],
      subject,
      text,
      // Replying in the inbox answers the person who wrote in.
      ...(replyTo ? { reply_to: [replyTo] } : {}),
    }),
  });

  if (!response.ok) {
    // Resend's error body can quote the message; log only the status.
    throw new Error(`Resend responded ${response.status}`);
  }
}
