import { useState, type ReactNode } from "react";
import Head from "next/head";
import {
  Sprout,
  TrendingDown,
  Flame,
  CheckSquare,
  MessageSquare,
  CheckCircle,
  Pencil,
  Coins,
  CalendarRange,
  Clock,
  Landmark,
  Check,
  Info,
  ChevronDown,
  ChevronUp,
  type LucideIcon,
} from "lucide-react";
import {
  SiteLayout,
  SiteButton,
  Eyebrow,
  ProgressBar,
  StatusChip,
} from "@/components/site/SiteChrome";
import styles from "@/components/site/site.module.css";

/**
 * The public front page, translated from Mirian Website.dc.html.
 *
 * That file carries two options for the nav, hero, features, steps and final
 * CTA. This builds the defaults it ships with: centred nav, split hero, card
 * grid of features, numbered steps in a row, and the white-card CTA.
 */

/* ---------- Content ---------- */

const PROBLEMS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: TrendingDown,
    title: "Balances coloured like an emergency",
    body: "A number in alarm tones is not information. It's a flinch.",
  },
  {
    icon: Flame,
    title: "Streaks you can break",
    body: "Gamified consistency punishes exactly the people who need flexibility most.",
  },
  {
    icon: CheckSquare,
    title: "Paid or not paid, nothing between",
    body: "Part paid, late, or paid twice over are all real. A tick box can't hold them.",
  },
  {
    icon: MessageSquare,
    title: "Copy that talks down to you",
    body: "“You missed a payment!” has never once helped anybody make one.",
  },
];

const FEATURES: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: CheckCircle,
    title: "Four honest payment states",
    body: "Paid on time, late, part paid, or part paid and late. Not a tick box that calls half a payment a failure.",
  },
  {
    icon: Pencil,
    title: "Notes on any payment",
    body: "Why it was short, what you agreed on the phone, what to chase next month. Context without commentary.",
  },
  {
    icon: Coins,
    title: "Partial and overpayments",
    body: "Pay £20 or pay double. Both get recorded properly, and overpayments pull your date closer.",
  },
  {
    icon: CalendarRange,
    title: "Due dates per debt",
    body: "Each debt keeps its own direct debit date, so you can see the month ahead without opening a bank app.",
  },
  {
    icon: Clock,
    title: "A debt-free date, front and centre",
    body: "The one number that actually motivates: when this ends. It updates as you log.",
  },
  {
    icon: Landmark,
    title: "Arrangements and contacts",
    body: "Plan in place, needs setting up, awaiting response — plus the creditor's number, kept with the debt.",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Add your debts",
    body: "Company and amount is enough. The rest can wait, or stay blank forever.",
  },
  {
    n: "2",
    title: "Set up arrangements",
    body: "Mark each one as in place, needs setting up, or awaiting response. Honest status, no pressure.",
  },
  {
    n: "3",
    title: "Log payments your way",
    body: "On time, late, part paid, overpaid — with a note if you want one.",
  },
  {
    n: "4",
    title: "Watch the date come closer",
    body: "Every payment you log moves your debt-free date. That's the whole reward.",
  },
];

const AUDIENCE = [
  "ADHD brains that need the number to be one number",
  "PDA brains that shut down when an app starts instructing",
  "Anyone who's abandoned a budgeting app out of dread",
  "Anyone mid-way through a debt plan who wants a calmer record",
];

const QUOTES = [
  "I opened it without that drop in my stomach. That's the first time an app about money has done that.",
  "Logging a half payment and not being told off changed how often I logged anything at all.",
  "The date moved forward by two months and I cried a bit, honestly.",
];

const FAQS = [
  {
    q: "Is my data private?",
    a: "Yes. Your debts are yours — nothing is shared with creditors, credit reference agencies or anyone else, and Mirian never contacts anyone on your behalf.",
  },
  {
    q: "Does using this affect my credit score?",
    a: "No. Mirian is a private record of what you've paid. It doesn't touch your credit file and it can't report anything about you.",
  },
  {
    q: "Can I track more than one debt?",
    a: "As many as you have. Each one keeps its own monthly amount, due date, arrangement status and creditor contact details.",
  },
  {
    q: "What if I miss a month?",
    a: "Nothing happens. There's no streak to lose and no reminder that shames you. You can log it later, or log it as nothing paid — both are just facts.",
  },
  {
    q: "Is it free?",
    a: "Free while it's in development. If that changes, existing accounts will hear about it well before anything does.",
  },
];

/* ---------- Small building blocks ---------- */

const SECTION_HEADING = {
  fontFamily: "var(--font-display)",
  fontSize: "clamp(28px,3.4vw,38px)",
  lineHeight: 1.15,
  fontWeight: 800,
  color: "rgb(var(--ink-900))",
  textWrap: "pretty",
} as const;

function IconTile({ icon: Icon, size = 44 }: { icon: LucideIcon; size?: number }) {
  return (
    <div
      style={{
        flex: "none",
        width: size,
        height: size,
        borderRadius: "var(--radius-md)",
        background: "rgb(var(--ice-100))",
        display: "grid",
        placeItems: "center",
        color: "rgb(var(--teal-700))",
      }}
    >
      <Icon size={size / 2} aria-hidden="true" />
    </div>
  );
}

function Section({
  children,
  background,
  label,
}: {
  children: ReactNode;
  background: string;
  label: string;
}) {
  return (
    <section
      aria-label={label}
      style={{ background, borderBottom: "1px solid rgb(var(--line-200))" }}
    >
      {children}
    </section>
  );
}

/* ---------- Page ---------- */

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <>
      <Head>
        <title>Mirian — a debt tracker that doesn&rsquo;t tell you off</title>
        <meta
          name="description"
          content="Mirian is a debt tracker for ADHD and PDA brains. A debt-free date instead of a running total, four honest payment states, and nothing on screen that tells you off."
        />
      </Head>

      <SiteLayout>
        {/* ---------- Hero ---------- */}
        <section
          aria-label="Mirian"
          style={{
            background:
              "linear-gradient(160deg,rgb(var(--ice-100)) 0%,rgb(var(--paper)) 52%,rgb(var(--teal-50)) 100%)",
            borderBottom: "1px solid rgb(var(--line-200))",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              maxWidth: 1120,
              margin: "0 auto",
              padding: "80px 24px 88px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))",
              gap: 56,
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgb(var(--white))",
                  border: "1px solid rgb(var(--line-200))",
                  borderRadius: "var(--radius-pill)",
                  padding: "7px 14px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "rgb(var(--teal-700))",
                  marginBottom: 22,
                }}
              >
                <Sprout size={16} aria-hidden="true" />
                Built for ADHD and PDA brains
              </div>

              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(36px,5vw,60px)",
                  lineHeight: 1.08,
                  letterSpacing: "-0.02em",
                  fontWeight: 800,
                  color: "rgb(var(--ink-900))",
                  margin: "0 0 20px",
                  textWrap: "pretty",
                }}
              >
                You have a debt-free date. Mirian&nbsp;helps you find it.
              </h1>

              <p
                style={{
                  fontSize: 20,
                  lineHeight: 1.55,
                  color: "rgb(var(--ink-700))",
                  margin: "0 0 32px",
                  maxWidth: "52ch",
                  textWrap: "pretty",
                }}
              >
                Not a shrinking balance you have to stare at. Not a streak you can
                break. Just the date it all ends, and a calmer way to get there —
                flexible, non-punishing, judgment-free.
              </p>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <SiteButton href="/auth/signup" size="lg" iconAfter>
                  Get started
                </SiteButton>
                <SiteButton href="#how" size="lg" variant="ghost">
                  See how it works
                </SiteButton>
              </div>

              <p style={{ fontSize: 15, color: "rgb(var(--ink-500))", margin: "22px 0 0" }}>
                Two fields is enough to start. You can stop half-way and it still
                counts.
              </p>
            </div>

            {/* Layered cards: a glimpse of the app itself */}
            <div style={{ position: "relative", minHeight: 496 }}>
              <div
                className={styles.tilt}
                style={{
                  position: "absolute",
                  right: 0,
                  top: 0,
                  width: "min(100%,360px)",
                  background: "rgb(var(--white))",
                  border: "1px solid rgb(var(--line-200))",
                  borderRadius: "var(--radius-2xl)",
                  boxShadow: "var(--shadow-md)",
                  padding: 20,
                  transform: "rotate(2deg)",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: ".1em",
                    textTransform: "uppercase",
                    color: "rgb(var(--ink-500))",
                    marginBottom: 12,
                  }}
                >
                  This year
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 8 }}>
                  {[
                    { m: "J", bg: "rgb(var(--ok-100))", line: "rgb(var(--ok-200))", fg: "rgb(var(--ok-600))" },
                    { m: "F", bg: "rgb(var(--ok-100))", line: "rgb(var(--ok-200))", fg: "rgb(var(--ok-600))" },
                    { m: "M", bg: "rgb(var(--warn-100))", line: "rgb(var(--warn-200))", fg: "rgb(var(--warn-600))" },
                    { m: "A", bg: "rgb(var(--ok-100))", line: "rgb(var(--ok-200))", fg: "rgb(var(--ok-600))" },
                    { m: "M", bg: "rgb(var(--now-100))", line: "rgb(var(--now-200))", fg: "rgb(var(--now-600))" },
                    { m: "J", bg: "rgb(var(--paper-sunk))", line: "rgb(var(--line-200))", fg: "rgb(var(--ink-400))" },
                  ].map((cell, i) => (
                    <div
                      key={i}
                      style={{
                        height: 38,
                        borderRadius: "var(--radius-sm)",
                        background: cell.bg,
                        border: `1px solid ${cell.line}`,
                        display: "grid",
                        placeItems: "center",
                        fontSize: 12,
                        fontWeight: 700,
                        color: cell.fg,
                      }}
                    >
                      {cell.m}
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 96,
                  width: "min(100%,340px)",
                  background: "rgb(var(--white))",
                  border: "1px solid rgb(var(--line-200))",
                  borderRadius: "var(--radius-2xl)",
                  boxShadow: "var(--shadow-lg)",
                  padding: 26,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: ".1em",
                    textTransform: "uppercase",
                    color: "rgb(var(--ink-500))",
                  }}
                >
                  Debt-free by
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 44,
                    fontWeight: 800,
                    color: "rgb(var(--ink-900))",
                    lineHeight: 1.1,
                    margin: "8px 0 4px",
                  }}
                >
                  March 2029
                </div>
                <div style={{ fontSize: 15, color: "rgb(var(--ink-500))", marginBottom: 20 }}>
                  31 months to go · 2 months sooner than last time
                </div>
                <ProgressBar percent={42} label="42% paid overall" />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 10,
                    fontSize: 15,
                    color: "rgb(var(--ink-700))",
                  }}
                >
                  <span>£5,180 paid</span>
                  <span style={{ color: "rgb(var(--ink-500))" }}>£7,120 left</span>
                </div>
              </div>

              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: 364,
                  background: "rgb(var(--white))",
                  border: "1px solid rgb(var(--line-200))",
                  borderRadius: "var(--radius-xl)",
                  boxShadow: "var(--shadow-md)",
                  padding: "14px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <StatusChip label="Payment plan in place" state="plan" />
                <StatusChip label="Awaiting response" state="waiting" />
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Why Mirian exists ---------- */}
        <Section background="rgb(var(--white))" label="Why Mirian exists">
          <div
            style={{
              maxWidth: 1120,
              margin: "0 auto",
              padding: "84px 24px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
              gap: 56,
              alignItems: "start",
            }}
          >
            <div>
              <Eyebrow>Why Mirian exists</Eyebrow>
              <h2 style={{ ...SECTION_HEADING, margin: "0 0 18px" }}>
                Most debt apps are built to make you feel behind
              </h2>
              <p style={{ fontSize: 18, color: "rgb(var(--ink-700))", margin: "0 0 16px", maxWidth: "54ch" }}>
                They colour your balance in alarm tones, count the days you&rsquo;ve
                kept up, and offer two boxes: paid, or not paid. Real repayment
                isn&rsquo;t like that. You pay a bit late. You pay half. You pay
                double one month because a payday landed well.
              </p>
              <p style={{ fontSize: 18, color: "rgb(var(--ink-700))", margin: 0, maxWidth: "54ch" }}>
                Mirian records what actually happened, and then gets out of your way.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {PROBLEMS.map((p) => (
                <div
                  key={p.title}
                  style={{
                    display: "flex",
                    gap: 16,
                    alignItems: "flex-start",
                    background: "rgb(var(--paper))",
                    border: "1px solid rgb(var(--line-200))",
                    borderRadius: "var(--radius-xl)",
                    padding: 20,
                  }}
                >
                  <IconTile icon={p.icon} size={40} />
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        color: "rgb(var(--ink-900))",
                        fontSize: 17,
                        marginBottom: 3,
                      }}
                    >
                      {p.title}
                    </div>
                    <div style={{ fontSize: 16, color: "rgb(var(--ink-500))" }}>{p.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ---------- What's inside ---------- */}
        <Section background="rgb(var(--paper))" label="What's inside">
          <div style={{ maxWidth: 1120, margin: "0 auto", padding: "84px 24px" }}>
            <div style={{ maxWidth: "60ch", marginBottom: 44 }}>
              <Eyebrow>What&rsquo;s inside</Eyebrow>
              <h2 style={{ ...SECTION_HEADING, margin: 0 }}>
                Enough detail to be honest, not enough to be a chore
              </h2>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))",
                gap: 20,
              }}
            >
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  style={{
                    background: "rgb(var(--white))",
                    border: "1px solid rgb(var(--line-200))",
                    borderRadius: "var(--radius-xl)",
                    boxShadow: "var(--shadow-sm)",
                    padding: 26,
                  }}
                >
                  <div style={{ marginBottom: 18 }}>
                    <IconTile icon={f.icon} />
                  </div>
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 20,
                      fontWeight: 700,
                      color: "rgb(var(--ink-900))",
                      margin: "0 0 8px",
                      lineHeight: 1.3,
                    }}
                  >
                    {f.title}
                  </h3>
                  <p style={{ fontSize: 16, color: "rgb(var(--ink-500))", margin: 0 }}>{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ---------- How it works ---------- */}
        <section
          id="how"
          aria-label="How it works"
          style={{ background: "rgb(var(--white))", borderBottom: "1px solid rgb(var(--line-200))" }}
        >
          <div style={{ maxWidth: 1120, margin: "0 auto", padding: "84px 24px" }}>
            <div style={{ maxWidth: "60ch", marginBottom: 48 }}>
              <Eyebrow>How it works</Eyebrow>
              <h2 style={{ ...SECTION_HEADING, margin: 0 }}>
                Four steps, and you can stop after any of them
              </h2>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))",
                gap: 24,
              }}
            >
              {STEPS.map((s) => (
                <div key={s.n} style={{ borderTop: "2px solid rgb(var(--teal-200))", paddingTop: 20 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "var(--radius-pill)",
                      background: "rgb(var(--teal-700))",
                      color: "rgb(var(--white))",
                      fontFamily: "var(--font-display)",
                      fontWeight: 800,
                      fontSize: 18,
                      display: "grid",
                      placeItems: "center",
                      marginBottom: 16,
                    }}
                  >
                    {s.n}
                  </div>
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 20,
                      fontWeight: 700,
                      color: "rgb(var(--ink-900))",
                      margin: "0 0 8px",
                    }}
                  >
                    {s.title}
                  </h3>
                  <p style={{ fontSize: 16, color: "rgb(var(--ink-500))", margin: 0 }}>{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Who it's for ---------- */}
        <Section
          background="linear-gradient(180deg,rgb(var(--ice-100)) 0%,rgb(var(--paper)) 100%)"
          label="Who it's for"
        >
          <div
            style={{
              maxWidth: 1120,
              margin: "0 auto",
              padding: "84px 24px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
              gap: 48,
              alignItems: "center",
            }}
          >
            <div>
              <Eyebrow>Who it&rsquo;s for</Eyebrow>
              <h2 style={{ ...SECTION_HEADING, margin: "0 0 18px" }}>
                Made for the brains that other finance apps quietly give up on
              </h2>
              <p style={{ fontSize: 18, color: "rgb(var(--ink-700))", margin: "0 0 16px", maxWidth: "52ch" }}>
                If instructions make you freeze, if the thought of opening a banking
                app makes your stomach drop, if you&rsquo;ve abandoned three
                budgeting tools because they started nagging — that&rsquo;s who this
                is for.
              </p>
              <p style={{ fontSize: 18, color: "rgb(var(--ink-700))", margin: 0, maxWidth: "52ch" }}>
                You don&rsquo;t need a diagnosis to use it. You just need somewhere to
                write it down.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {AUDIENCE.map((text) => (
                <div
                  key={text}
                  style={{
                    background: "rgb(var(--white))",
                    border: "1px solid rgb(var(--line-200))",
                    borderRadius: "var(--radius-xl)",
                    boxShadow: "var(--shadow-sm)",
                    padding: "20px 22px",
                    display: "flex",
                    gap: 14,
                    alignItems: "center",
                  }}
                >
                  <span style={{ flex: "none", color: "rgb(var(--teal-700))", display: "flex" }}>
                    <Check size={20} aria-hidden="true" />
                  </span>
                  <div style={{ fontSize: 17, color: "rgb(var(--ink-900))" }}>{text}</div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ---------- Testimonials (clearly labelled as samples) ---------- */}
        <Section background="rgb(var(--white))" label="What we're hoping people will say">
          <div style={{ maxWidth: 1120, margin: "0 auto", padding: "84px 24px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                gap: 24,
                flexWrap: "wrap",
                marginBottom: 36,
              }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(26px,3vw,32px)",
                  lineHeight: 1.2,
                  fontWeight: 800,
                  color: "rgb(var(--ink-900))",
                  margin: 0,
                  maxWidth: "26ch",
                  textWrap: "pretty",
                }}
              >
                What we&rsquo;re hoping people will say
              </h2>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgb(var(--paper-sunk))",
                  border: "1px solid rgb(var(--line-200))",
                  borderRadius: "var(--radius-pill)",
                  padding: "8px 14px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "rgb(var(--ink-500))",
                }}
              >
                <Info size={16} aria-hidden="true" />
                Sample quotes — real ones coming after beta
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
                gap: 20,
              }}
            >
              {QUOTES.map((text) => (
                <div
                  key={text}
                  style={{
                    background: "rgb(var(--paper))",
                    border: "1px dashed rgb(var(--line-300))",
                    borderRadius: "var(--radius-xl)",
                    padding: 26,
                    display: "flex",
                    flexDirection: "column",
                    gap: 18,
                  }}
                >
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 19,
                      lineHeight: 1.45,
                      color: "rgb(var(--ink-900))",
                      margin: 0,
                      textWrap: "pretty",
                    }}
                  >
                    {text}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginTop: "auto",
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "var(--radius-pill)",
                        background: "rgb(var(--ice-100))",
                        border: "1px solid rgb(var(--line-200))",
                      }}
                    />
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "rgb(var(--ink-700))" }}>
                        Sample quote
                      </div>
                      <div style={{ fontSize: 13, color: "rgb(var(--ink-400))" }}>
                        Illustrative placeholder
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ---------- FAQ ---------- */}
        <Section background="rgb(var(--paper))" label="Questions people ask first">
          <div style={{ maxWidth: 820, margin: "0 auto", padding: "84px 24px" }}>
            <h2 style={{ ...SECTION_HEADING, margin: "0 0 36px" }}>
              Questions people ask first
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {FAQS.map((f, i) => {
                const open = openFaq === i;
                return (
                  <div
                    key={f.q}
                    style={{
                      background: "rgb(var(--white))",
                      border: "1px solid rgb(var(--line-200))",
                      borderRadius: "var(--radius-xl)",
                      boxShadow: "var(--shadow-sm)",
                      overflow: "hidden",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? -1 : i)}
                      aria-expanded={open}
                      aria-controls={`faq-${i}`}
                      className={styles.faqButton}
                      style={{
                        width: "100%",
                        background: "none",
                        border: 0,
                        padding: "22px 24px",
                        minHeight: 48,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 20,
                        cursor: "pointer",
                        textAlign: "left",
                        fontFamily: "var(--font-display)",
                        fontSize: 19,
                        fontWeight: 700,
                        color: "rgb(var(--ink-900))",
                      }}
                    >
                      {f.q}
                      <span style={{ flex: "none", color: "rgb(var(--teal-700))", display: "flex" }}>
                        {open ? (
                          <ChevronUp size={20} aria-hidden="true" />
                        ) : (
                          <ChevronDown size={20} aria-hidden="true" />
                        )}
                      </span>
                    </button>
                    {open && (
                      <p
                        id={`faq-${i}`}
                        style={{
                          margin: 0,
                          padding: "0 24px 24px",
                          fontSize: 17,
                          color: "rgb(var(--ink-700))",
                          maxWidth: "60ch",
                        }}
                      >
                        {f.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Section>

        {/* ---------- Final call to action ---------- */}
        <section
          aria-label="Get started"
          style={{ background: "linear-gradient(160deg,rgb(var(--ice-100)) 0%,rgb(var(--teal-50)) 100%)" }}
        >
          <div style={{ maxWidth: 1120, margin: "0 auto", padding: "84px 24px" }}>
            <div
              style={{
                background: "rgb(var(--white))",
                border: "1px solid rgb(var(--line-200))",
                borderRadius: "var(--radius-2xl)",
                boxShadow: "var(--shadow-md)",
                padding: "clamp(32px,5vw,56px)",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
                gap: 36,
                alignItems: "center",
              }}
            >
              <div>
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(26px,3.2vw,36px)",
                    lineHeight: 1.15,
                    fontWeight: 800,
                    color: "rgb(var(--ink-900))",
                    margin: "0 0 14px",
                    textWrap: "pretty",
                  }}
                >
                  No judgment here. Let&rsquo;s get it tracked.
                </h2>
                <p style={{ fontSize: 18, color: "rgb(var(--ink-700))", margin: 0, maxWidth: "48ch" }}>
                  Add one debt and see what happens. You can leave the rest blank,
                  come back in a month, and nothing will have told you off.
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                  justifyContent: "flex-end",
                }}
              >
                <SiteButton href="/auth/login" size="lg" iconAfter>
                  Sign in to Mirian
                </SiteButton>
              </div>
            </div>
          </div>
        </section>
      </SiteLayout>
    </>
  );
}
