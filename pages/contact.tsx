import { useState } from "react";
import Head from "next/head";
import { SiteLayout, SiteButton, Field } from "@/components/site/SiteChrome";
import { LEGAL } from "@/lib/legal";

/**
 * Contact page, from Mirian Website.dc.html.
 *
 * The design's send button does nothing (it's a mock). Rather than ship a form
 * that looks like it sends and doesn't, this opens the sender's own email app
 * with the message ready — the same approach the app uses for writing to
 * creditors. No message is stored, and nothing is sent by Mirian.
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

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const mailto = () => {
    const body = `${message}\n\n—\n${name}${email ? `\n${email}` : ""}`;
    return `mailto:${LEGAL.contactEmail}?subject=${encodeURIComponent(
      "Mirian: a message from the website",
    )}&body=${encodeURIComponent(body)}`;
  };

  return (
    <>
      <Head>
        <title>Get in touch · Mirian</title>
        <meta
          name="description"
          content="Questions, worries, or something that isn't working — send it over. A real person reads these."
        />
      </Head>

      <SiteLayout>
        <section
          aria-label="Get in touch"
          style={{ background: "linear-gradient(180deg,rgb(var(--ice-100)) 0%,rgb(var(--paper)) 46%)" }}
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
            <p style={{ fontSize: 19, color: "rgb(var(--ink-700))", margin: "0 0 36px", maxWidth: "50ch" }}>
              Questions, worries, or something that isn&rsquo;t working — send it
              over. A real person reads these, and there&rsquo;s no wrong way to word
              it.
            </p>

            <div style={CARD}>
              <Field label="Your name" htmlFor="c-name" hint="Or whatever you'd like to be called">
                <input
                  id="c-name"
                  style={INPUT}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Hannah"
                />
              </Field>

              <Field label="Email" htmlFor="c-email" hint="So we can reply">
                <input
                  id="c-email"
                  type="email"
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
                  rows={5}
                  style={{ ...INPUT, minHeight: 120, resize: "vertical", lineHeight: 1.5 }}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What's on your mind?"
                />
              </Field>

              <div
                style={{
                  display: "flex",
                  gap: 14,
                  alignItems: "center",
                  flexWrap: "wrap",
                  marginTop: 4,
                }}
              >
                <SiteButton href={mailto()} size="lg">
                  Send message
                </SiteButton>
                <span style={{ fontSize: 15, color: "rgb(var(--ink-500))" }}>
                  This opens your own email app. We usually reply within a couple of
                  days.
                </span>
              </div>
            </div>

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
