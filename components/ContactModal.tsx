"use client";

import { useEffect, useRef, useState } from "react";
import {
  X,
  Copy,
  Mail,
  FileDown,
  Check,
  ChevronLeft,
  type LucideIcon,
} from "lucide-react";
import type { ContactLog, ContactMethod, Debt } from "@/lib/types";
import {
  TEMPLATES,
  FIELDS,
  EMAIL_TIP,
  fill,
  fillSubject,
  remainingGaps,
  tipFor,
  describeContact,
  type FieldKey,
  type FieldValues,
  type Template,
} from "@/lib/templates";
import type { NewContact } from "@/lib/hooks/useContacts";
import { downloadLetter } from "@/lib/letter";
import AdviceLinks from "@/components/AdviceLinks";

export type SaveDetails = (updates: {
  account_reference?: string;
  company_email?: string;
}) => Promise<unknown> | void;

type Props = {
  debt: Debt;
  /** From the profile; may arrive after the modal opens. */
  yourName: string;
  onClose: () => void;
  onLogged: (entry: NewContact) => Promise<ContactLog>;
  onSaveDetails: SaveDetails;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INPUT =
  "w-full min-h-[48px] bg-white border border-mint-200 rounded-lg px-4 py-2 text-sage-800 placeholder-sage-500 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand";
const LABEL = "text-xs text-sage-500 uppercase tracking-wider font-semibold";

/* Label with a "Where do I find this?" tip that opens underneath */
function FieldLabel({
  htmlFor,
  label,
  tipLabel,
  tip,
  open,
  onToggle,
}: {
  htmlFor: string;
  label: string;
  tipLabel: string;
  tip: string;
  open: boolean;
  onToggle: () => void;
}) {
  const tipId = `${htmlFor}-tip`;
  return (
    <>
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <label htmlFor={htmlFor} className={LABEL}>
          {label}
        </label>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={tipId}
          className="shrink-0 min-h-[32px] text-xs font-semibold text-brand hover:underline"
        >
          {tipLabel}
        </button>
      </div>
      {open && (
        <p
          id={tipId}
          className="mb-2 text-xs text-info-700 bg-info-100 border border-info-200 rounded-lg px-3 py-2.5"
        >
          {tip}
        </p>
      )}
    </>
  );
}

/* One of the three ways to use the message */
function ActionButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-2 min-h-[52px] px-3 rounded-xl border border-mint-200 bg-white hover:border-sage-300 active:bg-mint-100 text-sage-800 text-sm font-semibold transition-colors"
    >
      <Icon size={18} aria-hidden="true" />
      {label}
    </button>
  );
}

/**
 * Get in touch with a creditor: pick what to say, fill the gaps, then copy,
 * email or download it as a letter — and say whether it was sent, so it can
 * go in the debt's history.
 */
export default function ContactModal({
  debt,
  yourName,
  onClose,
  onLogged,
  onSaveDetails,
}: Props) {
  const [template, setTemplate] = useState<Template | null>(null);
  const [values, setValues] = useState<FieldValues>({
    your_name: yourName,
    account_reference: debt.account_reference ?? "",
    offer_amount: "",
  });
  const [email, setEmail] = useState(debt.company_email ?? "");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [bodyEdited, setBodyEdited] = useState(false);
  const [subjectEdited, setSubjectEdited] = useState(false);
  const [openTip, setOpenTip] = useState<FieldKey | "email" | null>(null);
  const [lastMethod, setLastMethod] = useState<ContactMethod | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const setField = (key: FieldKey, value: string) => {
    const next = { ...values, [key]: value };
    setValues(next);
    if (!template) return;
    // Once they've typed in the message themselves, leave it alone — the note
    // under the message offers to rebuild it instead.
    if (!subjectEdited) setSubject(fillSubject(template, next));
    if (!bodyEdited) setBody(fill(template.body, debt.company, next));
  };

  // The profile can load after the modal opens; use the name if still blank.
  useEffect(() => {
    if (yourName && !values.your_name?.trim()) setField("your_name", yourName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yourName]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const choose = (t: Template) => {
    setTemplate(t);
    setSubject(fillSubject(t, values));
    setBody(fill(t.body, debt.company, values));
    setBodyEdited(false);
    setSubjectEdited(false);
    setLastMethod(null);
    setNotice("");
    setError("");
  };

  const rebuild = () => {
    if (!template) return;
    setSubject(fillSubject(template, values));
    setBody(fill(template.body, debt.company, values));
    setBodyEdited(false);
    setSubjectEdited(false);
  };

  // Details they've just found shouldn't have to be found again.
  const detailsToSave = () => {
    const updates: { account_reference?: string; company_email?: string } = {};
    const ref = values.account_reference?.trim();
    const mail = email.trim();
    if (ref && ref !== (debt.account_reference ?? "")) {
      updates.account_reference = ref;
    }
    if (mail && EMAIL_PATTERN.test(mail) && mail !== (debt.company_email ?? "")) {
      updates.company_email = mail;
    }
    return updates;
  };

  const saveDetails = () => {
    const updates = detailsToSave();
    if (Object.keys(updates).length === 0) return;
    // A failed save mustn't get in the way of sending the message.
    Promise.resolve(onSaveDetails(updates)).catch(() => {});
  };

  const copyMessage = async () => {
    setError("");
    saveDetails();
    try {
      await navigator.clipboard.writeText(body);
    } catch {
      bodyRef.current?.select();
      document.execCommand("copy");
    }
    setLastMethod("copy");
    setNotice("Copied. You can paste it into their web form or online chat.");
  };

  const openEmail = () => {
    const to = email.trim();
    if (!EMAIL_PATTERN.test(to)) {
      setNotice("");
      setOpenTip("email");
      setError(
        to
          ? "That email address doesn't look quite right."
          : `Add ${debt.company}'s email address below first, or copy the message instead.`,
      );
      document.getElementById("contact-email")?.focus();
      return;
    }
    setError("");
    saveDetails();
    window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setLastMethod("email");
    setNotice("Your email app should open with the message ready to send.");
  };

  const letter = async () => {
    setError("");
    saveDetails();
    try {
      await downloadLetter({
        yourName: values.your_name?.trim() ?? "",
        company: debt.company,
        subject,
        body,
      });
      setLastMethod("letter");
      setNotice(
        "Your letter has downloaded. You can print it, sign it and post it.",
      );
    } catch {
      setError(
        "We couldn't make the letter just now. You can copy the message instead.",
      );
    }
  };

  const confirmSent = async () => {
    if (!template || !lastMethod) return;
    setIsSaving(true);
    setError("");
    try {
      const entry = await onLogged({
        template: template.id,
        method: lastMethod,
        subject: subject.trim() || null,
        body,
      });
      setSaved(describeContact(entry, debt.company));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We couldn't save that. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const gaps = remainingGaps(`${subject}\n${body}`);
  const willSave = Object.keys(detailsToSave()).length > 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Get in touch with ${debt.company}`}
      className="fixed inset-0 z-50 md:bg-sage-900/40 md:backdrop-blur-sm flex md:items-center md:justify-center md:p-4"
      onClick={onClose}
    >
      <div
        /* Full-screen sheet on a phone, like the log-payment modal: there's a
           keyboard and a long textarea, which a centred dialog handles badly. */
        className="w-full min-w-0 max-w-full h-[100dvh] md:h-auto flex flex-col md:block md:max-w-lg md:max-h-[calc(100dvh-2rem)] overflow-x-hidden overflow-y-auto bg-white md:border md:border-mint-200 md:rounded-2xl p-5 md:p-6 md:shadow-modal pb-[max(1.25rem,env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-5 shrink-0">
          <div className="min-w-0 flex items-start gap-1">
            {template && !saved && (
              <button
                onClick={() => {
                  setTemplate(null);
                  setLastMethod(null);
                  setNotice("");
                  setError("");
                }}
                aria-label="Back to choosing what to say"
                className="flex items-center justify-center w-11 h-11 -ml-3 rounded-xl text-sage-500 hover:bg-mint-100 transition-colors shrink-0"
              >
                <ChevronLeft size={22} />
              </button>
            )}
            <div className="min-w-0">
              <h3 className="text-xl font-bold text-sage-800">
                {saved
                  ? "Saved"
                  : template
                    ? template.title
                    : "What would you like to say?"}
              </h3>
              <p className="text-sm text-sage-500 mt-0.5 truncate">
                To {debt.company}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex items-center justify-center w-11 h-11 -mr-2 rounded-xl text-sage-500 hover:bg-mint-100 transition-colors shrink-0"
          >
            <X size={22} />
          </button>
        </div>

        {saved ? (
          /* Saved to the debt's history */
          <div className="text-center py-6">
            <div className="flex justify-center mb-3">
              <span className="flex items-center justify-center w-12 h-12 rounded-full bg-ok-100 text-ok-600">
                <Check size={24} />
              </span>
            </div>
            <p className="text-sage-800 font-semibold">
              Well done for getting in touch.
            </p>
            <p className="text-sm text-sage-600 mt-2">
              We&rsquo;ve added this to {debt.company}&rsquo;s history:
            </p>
            <p className="text-sm text-sage-800 mt-1">{saved}</p>
            <button
              onClick={onClose}
              className="mt-6 w-full min-h-[48px] bg-sage-600 hover:bg-sage-700 text-white font-semibold rounded-pill transition-colors"
            >
              Done
            </button>
          </div>
        ) : !template ? (
          /* Choose what to say */
          <div className="space-y-2.5">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => choose(t)}
                className="w-full min-h-[56px] px-4 py-3 bg-white border border-mint-200 hover:border-sage-300 active:bg-mint-100 rounded-xl text-left text-sage-800 text-sm font-medium transition-colors"
              >
                {t.title}
              </button>
            ))}
            <p className="text-xs text-sage-500 pt-2">
              We&rsquo;ll write the message for you. You can change anything
              before you send it.
            </p>
            <AdviceLinks className="pt-1" />
          </div>
        ) : (
          /* Write and send the message */
          <div className="space-y-4">
            {/* Details that fill the gaps */}
            {template.fields.map((key) => {
              const field = FIELDS[key];
              return (
                <div key={key}>
                  <FieldLabel
                    htmlFor={`contact-${key}`}
                    label={field.label}
                    tipLabel={field.tipLabel}
                    tip={tipFor(field.tip, debt.company)}
                    open={openTip === key}
                    onToggle={() => setOpenTip(openTip === key ? null : key)}
                  />
                  <input
                    id={`contact-${key}`}
                    type="text"
                    inputMode={field.inputMode ?? "text"}
                    value={values[key] ?? ""}
                    onChange={(e) => setField(key, e.target.value)}
                    placeholder={field.example}
                    className={INPUT}
                  />
                </div>
              );
            })}

            {/* The message */}
            <div>
              <label
                htmlFor="contact-subject"
                className={`${LABEL} block mb-1.5`}
              >
                Subject
              </label>
              <input
                id="contact-subject"
                type="text"
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  setSubjectEdited(true);
                }}
                className={INPUT}
              />
            </div>
            <div>
              <label htmlFor="contact-body" className={`${LABEL} block mb-1.5`}>
                Message
              </label>
              <textarea
                id="contact-body"
                ref={bodyRef}
                value={body}
                onChange={(e) => {
                  setBody(e.target.value);
                  setBodyEdited(true);
                }}
                rows={12}
                className="w-full bg-white border border-mint-200 rounded-lg px-4 py-3 text-sage-800 leading-relaxed focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand resize-y"
              />
              {(bodyEdited || subjectEdited) && (
                <p className="text-xs text-sage-500 mt-1.5">
                  You&rsquo;ve changed the message, so the boxes above
                  won&rsquo;t update it any more.{" "}
                  <button
                    type="button"
                    onClick={rebuild}
                    className="font-semibold text-brand hover:underline"
                  >
                    Start it again
                  </button>
                </p>
              )}
            </div>

            {/* Gaps still to fill */}
            {gaps.length > 0 && (
              <p className="p-3 rounded-lg bg-warn-100 border border-warn-200 text-warn-700 text-sm">
                Still to fill in: {gaps.map((g) => g.placeholder).join(", ")}.
                It&rsquo;s fine to send it without, just take out anything in
                [brackets] first.
              </p>
            )}

            {/* Company email — only needed for the email option */}
            <div>
              <FieldLabel
                htmlFor="contact-email"
                label={`${debt.company}'s email`}
                tipLabel="Where do I find this?"
                tip={tipFor(EMAIL_TIP, debt.company)}
                open={openTip === "email"}
                onToggle={() =>
                  setOpenTip(openTip === "email" ? null : "email")
                }
              />
              <input
                id="contact-email"
                type="email"
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Only needed to open your email app"
                className={INPUT}
              />
            </div>

            {willSave && (
              <p className="text-xs text-sage-500">
                We&rsquo;ll save the details you&rsquo;ve added to{" "}
                {debt.company}, so you won&rsquo;t need to find them again.
              </p>
            )}

            {/* Ways to send it */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <ActionButton icon={Copy} label="Copy message" onClick={copyMessage} />
              <ActionButton icon={Mail} label="Open in email" onClick={openEmail} />
              <ActionButton icon={FileDown} label="Download letter" onClick={letter} />
            </div>

            <p aria-live="polite" className="text-sm text-sage-600 empty:hidden">
              {notice}
            </p>
            {error && (
              <p
                role="alert"
                className="text-sm text-warn-700 bg-warn-100 border border-warn-200 rounded-lg px-3 py-2.5"
              >
                {error}
              </p>
            )}

            {/* Did you send it? */}
            {lastMethod && (
              <div className="p-4 rounded-xl border border-mint-200 bg-paper-sunk">
                <p className="text-sage-800 font-semibold text-sm">
                  Did you send it?
                </p>
                <p className="text-xs text-sage-600 mt-0.5">
                  If you did, we&rsquo;ll keep a note of it on {debt.company},
                  so you don&rsquo;t have to remember.
                </p>
                <div className="flex gap-2.5 mt-3">
                  <button
                    onClick={confirmSent}
                    disabled={isSaving}
                    className="flex-1 min-h-[48px] bg-sage-600 hover:bg-sage-700 text-white font-semibold rounded-pill disabled:opacity-50 text-sm transition-colors"
                  >
                    {isSaving ? "Saving…" : "Yes, I sent it"}
                  </button>
                  <button
                    onClick={() => {
                      setLastMethod(null);
                      setNotice(
                        "No problem. Your message is still here when you're ready.",
                      );
                    }}
                    className="flex-1 min-h-[48px] bg-mint-100 hover:bg-mint-200 text-sage-700 font-medium rounded-pill border border-mint-200 text-sm transition-colors"
                  >
                    Not yet
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
