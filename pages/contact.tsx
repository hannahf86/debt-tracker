import { useRef, useState, type FormEvent } from "react";
import { Check } from "lucide-react";
import { SiteLayout, Field } from "@/components/site/SiteChrome";
import Seo from "@/components/Seo";
import { LEGAL } from "@/lib/legal";

/**
 * Contact page, from Mirian Website.dc.html.
 *
 * Posts to /api/site/message, which emails it and stores nothing. The hidden
 * "website" field and the time the form was opened are spam defences the API
 * checks; a person never sees or fills either.
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

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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
          form: "contact",
          name,
          email,
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
        title="Get in touch"
        description="Questions, worries, or something that isn't working in Mirian — send it over. A real person reads these, and there's no wrong way to word it."
        path="/contact"
      />

      <SiteLayout>
        <section
          aria-label="Get in touch"
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
              Get in touch
            </h1>
            <p
              style={{
                fontSize: 19,
                color: "rgb(var(--ink-700))",
                margin: "0 0 36px",
                maxWidth: "50ch",
              }}
            >
              Questions, worries, or something that isn&rsquo;t working — send it
              over. A real person reads these, and there&rsquo;s no wrong way to word
              it.
            </p>

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
                  That&rsquo;s sent. Thank you.
                </h2>
                <p style={{ fontSize: 17, color: "rgb(var(--ink-700))", margin: 0 }}>
                  We usually reply within a couple of days
                  {email ? `, to ${email}` : ""}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={CARD} noValidate>
                <Field
                  label="Your name"
                  htmlFor="c-name"
                  hint="Or whatever you'd like to be called"
                >
                  <input
                    id="c-name"
                    name="name"
                    autoComplete="name"
                    style={INPUT}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Hannah"
                  />
                </Field>

                <Field label="Email" htmlFor="c-email" hint="So we can reply">
                  <input
                    id="c-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    style={INPUT}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </Field>

                <Field
                  label="Message"
                  htmlFor="c-msg"
                  hint="A sentence is plenty. Half-finished is still fine."
                >
                  <textarea
                    id="c-msg"
                    name="message"
                    rows={5}
                    required
                    style={{
                      ...INPUT,
                      minHeight: 120,
                      resize: "vertical",
                      lineHeight: 1.5,
                    }}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="What's on your mind?"
                  />
                </Field>

                {/* Honeypot: hidden from people, irresistible to bots */}
                <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>
                  <label htmlFor="c-website">Leave this empty</label>
                  <input
                    id="c-website"
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
                    {status === "sending" ? "Sending…" : "Send message"}
                  </button>
                  <span style={{ fontSize: 15, color: "rgb(var(--ink-500))" }}>
                    We usually reply within a couple of days.
                  </span>
                </div>
              </form>
            )}

            <p style={{ fontSize: 17, color: "rgb(var(--ink-700))", margin: "28px 0 0" }}>
              Prefer plain email?{" "}
              <a href={`mailto:${LEGAL.contactEmail}`} style={{ fontWeight: 700 }}>
                {LEGAL.contactEmail}
              </a>
            </p>
          </div>
        </section>
      </SiteLayout>
    </>
  );
}
