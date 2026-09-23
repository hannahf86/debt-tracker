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
  Minus,
  MapPin,
  Circle,
  Wallet,
  BellRing,
  FileText,
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

/* StepChange/Equifax, 2025. Figures as published; the link is on the page. */
const RESEARCH = [
  {
    figure: "97%",
    body: "of neurodivergent people say their neurodivergence makes debt harder to manage",
  },
  { figure: "64%", body: "didn't ask their creditors for help" },
  {
    figure: "32%",
    body: "of those who reach debt advice disclose being neurodivergent at all",
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

/* Version two. Three only: a roadmap you can finish is worth more than a long one. */
const NEXT_UP: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Wallet,
    title: "Your money and the bank's money, side by side",
    body: "Your banking app shows one number. Some of that is yours and some is the overdraft. Mirian will show you both, separately, so a full-looking balance can't catch you out.",
  },
  {
    icon: BellRing,
    title: "A nudge when it's time to chase",
    body: "When you've sent a creditor a message and heard nothing back, Mirian will quietly remind you. No pressure, and no counting how long it's been.",
  },
  {
    icon: FileText,
    title: "A record you can hand over",
    body: "Every payment and every message, as one file you can print or send. For the times someone asks you to prove it.",
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
  {
    text: "The way the app works gets rid of the drop in my stomach. Somehow it makes it far easier to use than other trackers I've tried.",
    name: "Jenny",
    nd: "ADHD",
    id: "adhd",
  },
  {
    text: "Being able to log any payment I made and then put a note to remind myself what happened is really helpful.",
    name: "Steph",
    nd: "ASC",
    id: "asc",
  },
  {
    text: "Knowing EXACTLY when I'll be debt free is a game changer. I'm planning my party already!",
    name: "Norah",
    nd: "AuDHD",
    id: "audhd",
  },
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

/* This year, in the hero card: paid, paid, part paid, paid, now, then blanks. */
const MONTH_CELLS: [string, string][] = [
  ["--ok-100", "--ok-200"],
  ["--ok-100", "--ok-200"],
  ["--warn-100", "--warn-200"],
  ["--ok-100", "--ok-200"],
  ["--now-100", "--now-200"],
  ["--paper-sunk", "--line-200"],
  ["--paper-sunk", "--line-200"],
  ["--paper-sunk", "--line-200"],
];

/* The specimen year beside the lead feature: a glyph per payment state. */
const SPECIMEN_MONTHS: { name: string; icon: LucideIcon }[] = [
  { name: "Jan", icon: Check },
  { name: "Feb", icon: Check },
  { name: "Mar", icon: Minus },
  { name: "Apr", icon: Check },
  { name: "May", icon: MapPin },
  { name: "Jun", icon: Circle },
  { name: "Jul", icon: Circle },
  { name: "Aug", icon: Circle },
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
              "linear-gradient(180deg,rgb(var(--ice-100)) 0%,rgb(var(--paper)) 70%)",
            borderBottom: "1px solid rgb(var(--line-200))",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              maxWidth: 880,
              margin: "0 auto",
              padding: "76px 24px 0",
              textAlign: "center",
            }}
          >
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
                fontSize: "clamp(36px,5.4vw,60px)",
                lineHeight: 1.08,
                letterSpacing: "-0.02em",
                fontWeight: 800,
                color: "rgb(var(--ink-900))",
                margin: "0 0 20px",
                textWrap: "pretty",
              }}
            >
              A debt-free date, not a running total of everything you owe
            </h1>

            <p
              style={{
                fontSize: 20,
                lineHeight: 1.55,
                color: "rgb(var(--ink-700))",
                margin: "0 auto 32px",
                maxWidth: "56ch",
                textWrap: "pretty",
              }}
            >
              Mirian is a debt tracker for ADHD and PDA brains. Flexible,
              non-punishing, judgment-free &mdash; and nothing on screen tells you
              off.
            </p>

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <SiteButton href="/auth/signup" size="lg" iconAfter>
                Get started
              </SiteButton>
              <SiteButton href="#how" size="lg" variant="ghost">
                See how it works
              </SiteButton>
            </div>
          </div>

          {/* Three cards beneath, the date in the middle */}
          <div
            style={{
              maxWidth: 1000,
              margin: "0 auto",
              padding: "52px 24px 0",
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 16,
                alignItems: "flex-end",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <div
                className={styles.tilt}
                style={{
                  flex: 1,
                  minWidth: 200,
                  maxWidth: 260,
                  background: "rgb(var(--white))",
                  border: "1px solid rgb(var(--line-200))",
                  borderRadius: "var(--radius-2xl)",
                  boxShadow: "var(--shadow-md)",
                  padding: 20,
                  transform: "rotate(-2deg)",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: ".1em",
                    textTransform: "uppercase",
                    color: "rgb(var(--ink-500))",
                    marginBottom: 10,
                  }}
                >
                  Paid so far
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 32,
                    fontWeight: 800,
                    color: "rgb(var(--ink-900))",
                  }}
                >
                  &pound;5,180
                </div>
                <div style={{ marginTop: 14 }}>
                  <ProgressBar percent={42} label="42% paid overall" />
                </div>
              </div>

              <div
                style={{
                  flex: 1.4,
                  minWidth: 280,
                  maxWidth: 380,
                  background: "rgb(var(--white))",
                  border: "1px solid rgb(var(--line-200))",
                  borderRadius: "var(--radius-2xl)",
                  boxShadow: "var(--shadow-lg)",
                  padding: 28,
                  position: "relative",
                  zIndex: 2,
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
                    fontSize: 46,
                    fontWeight: 800,
                    color: "rgb(var(--ink-900))",
                    lineHeight: 1.1,
                    margin: "8px 0 4px",
                  }}
                >
                  March 2029
                </div>
                <div style={{ fontSize: 15, color: "rgb(var(--ink-500))" }}>
                  31 months to go
                </div>
                <div
                  style={{
                    marginTop: 20,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <StatusChip label="Payment plan in place" state="plan" />
                  <StatusChip label="Needs setting up" state="todo" />
                </div>
              </div>

              <div
                className={styles.tilt}
                style={{
                  flex: 1,
                  minWidth: 200,
                  maxWidth: 260,
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
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4,1fr)",
                    gap: 7,
                  }}
                >
                  {MONTH_CELLS.map(([bg, line], i) => (
                    <div
                      key={i}
                      style={{
                        height: 34,
                        borderRadius: "var(--radius-sm)",
                        background: `rgb(var(${bg}))`,
                        border: `1px solid rgb(var(${line}))`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div style={{ height: 56 }} />
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

        {/* ---------- The research ---------- */}
        <Section background="rgb(var(--paper-sunk))" label="The research">
          <div style={{ maxWidth: 1120, margin: "0 auto", padding: "84px 24px" }}>
            <div style={{ maxWidth: "60ch", marginBottom: 44 }}>
              <Eyebrow>The research</Eyebrow>
              <h2 style={{ ...SECTION_HEADING, margin: 0 }}>
                Almost everyone finds this harder. Almost nobody says so.
              </h2>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
                gap: 24,
                marginBottom: 40,
              }}
            >
              {RESEARCH.map((stat) => (
                <div
                  key={stat.figure}
                  style={{
                    borderTop: "2px solid rgb(var(--teal-200))",
                    borderBottom: "1px solid rgb(var(--line-200))",
                    padding: "20px 0 22px",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "clamp(40px,5vw,54px)",
                      lineHeight: 1,
                      fontWeight: 800,
                      color: "rgb(var(--teal-700))",
                      marginBottom: 12,
                    }}
                  >
                    {stat.figure}
                  </div>
                  <p
                    style={{
                      fontSize: 19,
                      fontWeight: 600,
                      lineHeight: 1.4,
                      color: "rgb(var(--ink-900))",
                      margin: 0,
                    }}
                  >
                    {stat.body}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ maxWidth: "62ch" }}>
              <p style={{ fontSize: 18, color: "rgb(var(--ink-700))", margin: "0 0 16px" }}>
                The gap isn&rsquo;t awareness. It&rsquo;s shame — overwhelm, anxiety and
                stigma are the top reasons people go quiet at exactly the moment
                support would help most.
              </p>
              <p style={{ fontSize: 18, color: "rgb(var(--ink-700))", margin: "0 0 16px" }}>
                With a PDA profile it goes further. Demands themselves set off anxiety
                and avoidance, so the harder an app pushes &ldquo;pay now&rdquo;, the
                more surely it gets ignored. Mirian is built to lower the demand, not
                raise it.
              </p>
              <p style={{ fontSize: 15, color: "rgb(var(--ink-500))", margin: 0 }}>
                Figures from{" "}
                <a
                  href="https://www.stepchange.org/about-us/impact-report-2025/equifax.aspx"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "rgb(var(--teal-700))", fontWeight: 700 }}
                >
                  StepChange and Equifax, 2025
                </a>
                .
              </p>
            </div>
          </div>
        </Section>

        {/* ---------- What's inside ---------- */}
        <Section background="rgb(var(--paper))" label="What's inside">
          <div style={{ maxWidth: 1120, margin: "0 auto", padding: "84px 24px" }}>
            <div style={{ maxWidth: "60ch", marginBottom: 52 }}>
              <Eyebrow>What&rsquo;s inside</Eyebrow>
              <h2 style={{ ...SECTION_HEADING, margin: 0 }}>
                Enough detail to be honest, not enough to be a chore
              </h2>
            </div>

            {/* Lead feature, with a year of payments beside it */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
                gap: 48,
                alignItems: "center",
                marginBottom: 64,
              }}
            >
              <div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 26,
                    fontWeight: 800,
                    color: "rgb(var(--ink-900))",
                    margin: "0 0 12px",
                  }}
                >
                  Four honest states, not a tick box
                </h3>
                <p
                  style={{
                    fontSize: 18,
                    color: "rgb(var(--ink-700))",
                    margin: "0 0 14px",
                    maxWidth: "50ch",
                  }}
                >
                  Paid on time, late, part paid, or part paid and late. Each one
                  has a word and a glyph, so you can read a year at a glance
                  without decoding colours.
                </p>
                <p
                  style={{
                    fontSize: 16,
                    color: "rgb(var(--ink-500))",
                    margin: 0,
                    maxWidth: "50ch",
                  }}
                >
                  Overpayments are recorded too, and they move your date forward.
                </p>
              </div>

              <div
                style={{
                  background: "rgb(var(--white))",
                  border: "1px solid rgb(var(--line-200))",
                  borderRadius: "var(--radius-2xl)",
                  boxShadow: "var(--shadow-md)",
                  padding: 24,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: ".1em",
                    textTransform: "uppercase",
                    color: "rgb(var(--ink-500))",
                    marginBottom: 14,
                  }}
                >
                  Barclaycard &middot; 2026
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4,1fr)",
                    gap: 10,
                  }}
                >
                  {SPECIMEN_MONTHS.map(({ name, icon: Glyph }) => (
                    <div
                      key={name}
                      style={{
                        borderRadius: "var(--radius-md)",
                        padding: "10px 8px",
                        textAlign: "center",
                        border: "1px solid rgb(var(--line-200))",
                        background: "rgb(var(--paper-sunk))",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          letterSpacing: ".06em",
                          textTransform: "uppercase",
                          color: "rgb(var(--ink-500))",
                        }}
                      >
                        {name}
                      </div>
                      <div
                        style={{
                          marginTop: 6,
                          display: "grid",
                          placeItems: "center",
                          color: "rgb(var(--ink-400))",
                        }}
                      >
                        <Glyph size={18} aria-hidden="true" />
                      </div>
                    </div>
                  ))}
                </div>
                <p
                  style={{
                    fontSize: 15,
                    color: "rgb(var(--ink-500))",
                    margin: "16px 0 0",
                  }}
                >
                  Late payments happen &mdash; what matters is you&rsquo;re on it.
                </p>
              </div>
            </div>

            {/* The rest of what is inside */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))",
                gap: 20,
              }}
            >
              {FEATURES.slice(1).map((f) => (
                <div
                  key={f.title}
                  style={{
                    background: "rgb(var(--white))",
                    border: "1px solid rgb(var(--line-200))",
                    borderRadius: "var(--radius-xl)",
                    boxShadow: "var(--shadow-sm)",
                    padding: 24,
                    display: "flex",
                    gap: 16,
                    alignItems: "flex-start",
                  }}
                >
                  <IconTile icon={f.icon} size={40} />
                  <div>
                    <h3
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: 19,
                        fontWeight: 700,
                        color: "rgb(var(--ink-900))",
                        margin: "0 0 6px",
                        lineHeight: 1.3,
                      }}
                    >
                      {f.title}
                    </h3>
                    <p style={{ fontSize: 16, color: "rgb(var(--ink-500))", margin: 0 }}>
                      {f.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ---------- What we're building next ---------- */}
        <Section background="rgb(var(--ice-100))" label="What we're building next">
          <div style={{ maxWidth: 1120, margin: "0 auto", padding: "84px 24px" }}>
            <div style={{ maxWidth: "60ch", marginBottom: 44 }}>
              <Eyebrow>What we&rsquo;re building next</Eyebrow>
              <h2 style={{ ...SECTION_HEADING, margin: "0 0 14px" }}>
                Three things we&rsquo;re working on
              </h2>
              <p style={{ fontSize: 18, color: "rgb(var(--ink-700))", margin: 0 }}>
                No dates attached — we&rsquo;d rather show you than promise you. If the
                order looks wrong to you, say so and we&rsquo;ll change it.
              </p>
            </div>

            {/* Dashed borders, because none of this is built yet. */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))",
                gap: 20,
              }}
            >
              {NEXT_UP.map((f) => (
                <div
                  key={f.title}
                  style={{
                    background: "rgb(var(--white))",
                    border: "1px dashed rgb(var(--line-300))",
                    borderRadius: "var(--radius-xl)",
                    padding: 24,
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                  }}
                >
                  <IconTile icon={f.icon} size={40} />
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 19,
                      fontWeight: 700,
                      color: "rgb(var(--ink-900))",
                      margin: 0,
                      lineHeight: 1.3,
                    }}
                  >
                    {f.title}
                  </h3>
                  <p style={{ fontSize: 16, color: "rgb(var(--ink-500))", margin: 0 }}>
                    {f.body}
                  </p>
                </div>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                gap: 16,
                alignItems: "center",
                flexWrap: "wrap",
                marginTop: 36,
              }}
            >
              <SiteButton href="/feedback" variant="ghost" iconAfter>
                Tell us which would help most
              </SiteButton>
              <span style={{ fontSize: 16, color: "rgb(var(--ink-500))" }}>
                A sentence is plenty.
              </span>
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
            className={styles.audienceGrid}
            style={{ maxWidth: 1120, margin: "0 auto", padding: "84px 24px" }}
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
        <Section background="rgb(var(--white))" label="What we hope people will say">
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
                Examples for now — real quotes once testing is done
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
                gap: 20,
              }}
            >
              {QUOTES.map((quote) => (
                <div
                  key={quote.id}
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
                    {quote.text}
                  </p>
                  <div style={{ marginTop: "auto" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "rgb(var(--ink-700))" }}>
                      {quote.name} · {quote.nd} · Mirian tester
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
              <div className={styles.ctaStack}>
                <SiteButton href="/auth/login" size="lg" iconAfter>
                  Sign in to Mirian
                </SiteButton>
                <SiteButton href="/auth/signup" size="lg" variant="secondary">
                  Create an account
                </SiteButton>
              </div>
            </div>
          </div>
        </section>
      </SiteLayout>
    </>
  );
}
