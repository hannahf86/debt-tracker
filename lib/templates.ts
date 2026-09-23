import type { ContactLog, ContactMethod } from "@/lib/types";

/**
 * Message templates for getting in touch with a creditor.
 *
 * These are examples someone can send, not advice on what they should do —
 * recommending a particular debt solution is FCA-regulated advice. Keep the
 * wording calm, short, and free of anything that sounds like a legal threat.
 */

export type FieldKey = "your_name" | "account_reference" | "offer_amount";

export type TemplateField = {
  key: FieldKey;
  label: string;
  /** Wording on the button that reveals the tip. */
  tipLabel: string;
  /** Shown in the message until the field is filled in. */
  placeholder: string;
  /** {company} is swapped for the creditor's name. */
  tip: string;
  example: string;
  inputMode?: "text" | "decimal";
};

export const FIELDS: Record<FieldKey, TemplateField> = {
  your_name: {
    key: "your_name",
    label: "Your full name",
    tipLabel: "Which name?",
    placeholder: "[your name]",
    tip: "Use the name that's on your account with {company}, so they can find you.",
    example: "e.g. Sam Taylor",
  },
  account_reference: {
    key: "account_reference",
    label: "Account number or reference",
    tipLabel: "Where do I find this?",
    placeholder: "[your account number]",
    tip: "It's usually at the top of a letter or statement from {company}. You might also find it in their app, or in your banking app next to the payment.",
    example: "e.g. 1234 5678",
  },
  offer_amount: {
    key: "offer_amount",
    label: "What you could pay each month",
    tipLabel: "How much should I put?",
    placeholder: "[amount you can afford]",
    tip: "Only what you can manage after essentials like rent, food and energy. It's fine to start small.",
    example: "e.g. 25",
    inputMode: "decimal",
  },
};

export const EMAIL_TIP =
  "Look near the bottom of a letter or bill from {company}, or on their website's contact or 'help paying' page. Lots of companies don't give out an email address. If you can't find one, copy the message into their web form or online chat instead.";

export type Template = {
  id: string;
  /** What the person wants to say, in their own words — the thing they pick. */
  title: string;
  /** How it reads in their contact history: "... about {about}". */
  about: string;
  fields: FieldKey[];
  /** Subject without the account prefix, which is added when known. */
  subject: string;
  body: string;
};

const SIGN_OFF = "Thank you,\n{your_name}";
const OPENING = "Hello,\n\nI'm writing about my account, reference {account_reference}.";

export const TEMPLATES: Template[] = [
  {
    id: "cant_pay_this_month",
    title: "I can't pay this month",
    about: "not being able to pay this month",
    fields: ["your_name", "account_reference"],
    subject: "I can't make this month's payment",
    body: `${OPENING}

I'm not able to make this month's payment in full. I wanted to let you know as early as I can.

Please could you tell me what my options are, and whether there's any support available while I get back on track?

${SIGN_OFF}`,
  },
  {
    id: "payment_plan",
    title: "I'd like to set up a payment plan",
    about: "setting up a payment plan",
    fields: ["your_name", "account_reference", "offer_amount"],
    subject: "Request to set up a payment plan",
    body: `${OPENING}

I'm finding it difficult to keep up with my payments, and I'd like to set up a payment plan I can manage.

After my essential bills, I can afford to pay {offer_amount} a month. Please could you let me know if you can accept this, and confirm the details in writing?

${SIGN_OFF}`,
  },
  {
    id: "how_much_i_owe",
    title: "Please tell me how much I owe",
    about: "how much you owe",
    fields: ["your_name", "account_reference"],
    subject: "Request for a statement",
    body: `${OPENING}

Please could you send me a statement showing how much I currently owe, including any interest, fees or charges that have been added?

${SIGN_OFF}`,
  },
  {
    id: "contact_in_writing",
    title: "Please only contact me in writing",
    about: "being contacted in writing only",
    fields: ["your_name", "account_reference"],
    subject: "Please contact me in writing",
    body: `${OPENING}

I'd be grateful if you could contact me in writing only, by email or post, rather than by phone. This makes it easier for me to keep track of things and respond properly.

${SIGN_OFF}`,
  },
  {
    id: "freeze_interest",
    title: "Please freeze the interest",
    about: "asking them to freeze the interest",
    fields: ["your_name", "account_reference"],
    subject: "Request to freeze interest and charges",
    body: `${OPENING}

At the moment the interest being added each month is more than I'm able to pay, so the balance isn't going down.

Please could you freeze the interest and any charges on this account, so that the payments I make go towards clearing what I owe?

I want to keep paying what I can, and this would help me do that.

${SIGN_OFF}`,
  },
  {
    id: "getting_advice",
    title: "I'm getting free debt advice",
    about: "getting free debt advice",
    fields: ["your_name", "account_reference"],
    subject: "I'm getting free debt advice",
    body: `${OPENING}

I'm getting free, independent debt advice to help me sort out my finances. Please could you put any further collection action on hold for 30 days while I do this?

I'll be in touch with an update as soon as I can.

${SIGN_OFF}`,
  },
];

export type FieldValues = Partial<Record<FieldKey, string>>;

/** A filled-in value as it should read in the message. */
export function formatValue(key: FieldKey, value: string): string {
  const v = value.trim();
  if (key === "offer_amount") return `£${v.replace(/^£\s*/, "")}`;
  return v;
}

/** The message with every gap filled in, or left as a visible [placeholder]. */
export function fill(text: string, company: string, values: FieldValues): string {
  return text
    .replace(/\{company\}/g, company)
    .replace(/\{(your_name|account_reference|offer_amount)\}/g, (_, key: FieldKey) =>
      values[key]?.trim() ? formatValue(key, values[key] as string) : FIELDS[key].placeholder,
    );
}

/** Subject line, prefixed with the account reference when there is one. */
export function fillSubject(template: Template, values: FieldValues): string {
  const ref = values.account_reference?.trim();
  return ref ? `Account ${ref}: ${template.subject}` : template.subject;
}

/** Gaps still sitting in text the person may have edited by hand. */
export function remainingGaps(text: string): TemplateField[] {
  return Object.values(FIELDS).filter((f) => text.includes(f.placeholder));
}

export function tipFor(tip: string, company: string): string {
  return tip.replace(/\{company\}/g, company);
}

const VERB: Record<ContactMethod, string> = {
  email: "Emailed",
  letter: "Wrote to",
  copy: "Sent a message to",
};

/** "Emailed Halifax on 14 Sept about setting up a payment plan" */
export function describeContact(
  contact: Pick<ContactLog, "method" | "template" | "sent_at">,
  company: string,
): string {
  const about = TEMPLATES.find((t) => t.id === contact.template)?.about;
  const sent = new Date(contact.sent_at);
  const sameYear = sent.getFullYear() === new Date().getFullYear();
  const date = sent.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
  });
  return `${VERB[contact.method] ?? "Contacted"} ${company} on ${date}${about ? ` about ${about}` : ""}`;
}

/** Free, independent debt advice — never behind a paywall. */
export const FREE_ADVICE = [
  { name: "StepChange", url: "https://www.stepchange.org" },
  { name: "National Debtline", url: "https://nationaldebtline.org" },
  { name: "Citizens Advice", url: "https://www.citizensadvice.org.uk/debt-and-money/" },
];
