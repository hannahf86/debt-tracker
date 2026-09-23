import { useRef, useState, type FormEvent } from "react";
import { Info, Check } from "lucide-react";
import { SiteLayout, Field } from "@/components/site/SiteChrome";
import Seo from "@/components/Seo";

/**
 * Feedback page, from Mirian Website.dc.html.
 *
 * Posts to /api/site/message like the contact form. Name and email stay
 * optional on purpose: the design marks them so, and anonymous feedback is
 * still worth having.
 */

const CARD = {
  background: "rgb(var(--white))",
  border: "1px solid rgb(var(--line-200))",
  borderRadius: "var(--radius-2xl)",
  boxShadow: "var(--shadow-md)",
  padding: "clamp(24px,4vw,36px)",
  display: "flex",
  flexDirection: "column",
  gap: 20,
} as const;

const INPUT = {
  width: "100%",
  minHeight: 48,
  background: "rgb(var(--white))",
  border: "1px solid rgb(var(--line-300))",
  borderRadius: "var(--radius-sm)",
  padding: "10px 14px",
  fontFamily: "var(--font-body)",
  fontSize: 17,
  color: "rgb(var(--ink-900))",
} as const;

const SUBMIT = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 56,
  padding: "0 26px",
  borderRadius: "var(--radius-pill)",
  border: "1px solid transparent",
  background: "rgb(var(--teal-700))",
  color: "rgb(var(--white))",
  fontFamily: "var(--font-body)",
  fontSize: 18,
  fontWeight: 700,
} as const;

const TYPES = [
  { value: "bug", label: "Something's broken" },
  { value: "feature", label: "Feature request" },
  { value: "general", label: "General thoughts" },
];

export default function FeedbackPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState("bug");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const openedAt = useRef(Date.now());

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setStatus("sending");
    try {
      const response = await fetch("/api/site/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form: "feedback",
          name,
          email,
          type,
          message,
          website,
          startedAt: openedAt.current,
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error ?? "Something went wrong.");
      setStatus("sent");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We couldn't send that just now. Please try again.",
      );
      setStatus("idle");
    }
  };

  return (
    <>
      <Seo
        bareTitle
        title="Help shape Mirian — feedback"
        description="If something in Mirian is confusing, broken or missing, tell us. Feedback is the point — it's how the next version gets less annoying."
        path="/feedback"
      />

      <SiteLayout>
        <section
          aria-label="Feedback"
          style={{
            background:
              "linear-gradient(180deg,rgb(var(--ice-100)) 0%,rgb(var(--paper)) 46%)",
          }}
        >
          <div style={{ maxWidth: 680, margin: "0 auto", padding: "72px 24px 96px" }}>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(32px,4.4vw,44px)",
                lineHeight: 1.12,
                fontWeight: 800,
                color: "rgb(var(--ink-900))",
                margin: "0 0 14px",
              }}
            >
              Help shape Mirian
            </h1>
            <p
              style={{
                fontSize: 19,
                color: "rgb(var(--ink-700))",
                margin: "0 0 28px",
                maxWidth: "52ch",
              }}
            >
              If something is confusing, broken, or missing, we want to hear it.
              Feedback is the point — it&rsquo;s how the next version gets less
              annoying.
            </p>

            {/* Callout: nothing is too small */}
            <div
              style={{
                display: "flex",
                gap: 14,
                alignItems: "flex-start",
                background: "rgb(var(--info-100))",
                border: "1px solid rgb(var(--info-200))",
                borderRadius: "var(--radius-xl)",
                padding: "18px 20px",
                marginBottom: 28,
              }}
            >
              <span style={{ flex: "none", color: "rgb(var(--info-600))", display: "flex" }}>
                <Info size={20} aria-hidden="true" />
              </span>
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    color: "rgb(var(--ink-900))",
                    marginBottom: 2,
                  }}
                >
                  Nothing is too small
                </div>
                <div style={{ fontSize: 16, color: "rgb(var(--ink-700))" }}>
                  Typos, a button that&rsquo;s hard to hit, a word that landed badly.
                  All of it helps.
                </div>
              </div>
            </div>

            {status === "sent" ? (
              /* Sent */
              <div style={{ ...CARD, alignItems: "center", textAlign: "center" }}>
                <span
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "var(--radius-pill)",
                    background: "rgb(var(--ok-100))",
                    color: "rgb(var(--ok-600))",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <Check size={24} aria-hidden="true" />
                </span>
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 24,
                    fontWeight: 800,
                    color: "rgb(var(--ink-900))",
                    margin: 0,
                  }}
                >
                  Thank you, genuinely.
                </h2>
                <p style={{ fontSize: 17, color: "rgb(var(--ink-700))", margin: 0 }}>
                  That&rsquo;s gone straight to the person building Mirian
                  {email ? `, and we'll reply to ${email} if it needs one` : ""}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={CARD} noValidate>
                <Field
                  label="Name"
                  htmlFor="f-name"
                  hint="Optional — skip if you'd rather not"
                >
                  <input
                    id="f-name"
                    name="name"
                    autoComplete="name"
                    style={INPUT}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Optional"
                  />
                </Field>

                <Field
                  label="Email"
                  htmlFor="f-email"
                  hint="Optional — only if you'd like a reply"
                >
                  <input
                    id="f-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    style={INPUT}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Optional"
                  />
                </Field>

                <Field label="Type of feedback" htmlFor="f-type">
                  <select
                    id="f-type"
                    name="type"
                    style={INPUT}
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    {TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Tell us more" htmlFor="f-msg" hint="No need to tidy it up first.">
                  <textarea
                    id="f-msg"
                    name="message"
                    rows={6}
                    required
                    style={{
                      ...INPUT,
                      minHeight: 140,
                      resize: "vertical",
                      lineHeight: 1.5,
                    }}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="What happened, or what would help?"
                  />
                </Field>

                {/* Honeypot: hidden from people, irresistible to bots */}
                <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>
                  <label htmlFor="f-website">Leave this empty</label>
                  <input
                    id="f-website"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>

                {error && (
                  <p
                    role="alert"
                    style={{
                      margin: 0,
                      padding: "12px 14px",
                      borderRadius: "var(--radius-sm)",
                      background: "rgb(var(--warn-100))",
                      border: "1px solid rgb(var(--warn-200))",
                      color: "rgb(var(--warn-600))",
                      fontSize: 16,
                    }}
                  >
                    {error}
                  </p>
                )}

                <div
                  style={{
                    display: "flex",
                    gap: 14,
                    alignItems: "center",
                    flexWrap: "wrap",
                    marginTop: 4,
                  }}
                >
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    style={{
                      ...SUBMIT,
                      cursor: status === "sending" ? "wait" : "pointer",
                      opacity: status === "sending" ? 0.6 : 1,
                    }}
                  >
                    {status === "sending" ? "Sending…" : "Send feedback"}
                  </button>
                  <span style={{ fontSize: 15, color: "rgb(var(--ink-500))" }}>
                    Thank you, genuinely.
                  </span>
                </div>
              </form>
            )}
          </div>
        </section>
      </SiteLayout>
    </>
  );
}
