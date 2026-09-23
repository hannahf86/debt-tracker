import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ArrowRight, Menu, X } from "lucide-react";
import styles from "@/components/site/site.module.css";

/**
 * Shared furniture for the public marketing site: header, footer, and the
 * handful of design-system pieces the pages use (button, progress bar,
 * status chip, eyebrow).
 *
 * Translated from Mirian Website.dc.html. That file styles everything inline
 * from CSS custom properties, and the app already defines every one of those
 * tokens, so the styles carry across unchanged.
 */

/* ---------- Logo ---------- */

export function Logo({ size = 30 }: { size?: number }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <img src="/mark.svg" alt="" width={size} height={size} />
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: size * 0.8,
          letterSpacing: "-0.01em",
          color: "rgb(var(--ink-900))",
        }}
      >
        Mirian
      </span>
    </span>
  );
}

/* ---------- Button ---------- */

type ButtonProps = {
  href: string;
  children: ReactNode;
  size?: "md" | "lg";
  variant?: "primary" | "ghost" | "secondary";
  iconAfter?: boolean;
  onClick?: () => void;
};

const BUTTON_VARIANT: Record<string, CSSProperties> = {
  primary: { background: "rgb(var(--teal-700))", color: "rgb(var(--white))", border: "1px solid transparent" },
  ghost: { background: "transparent", color: "rgb(var(--teal-700))", border: "1px solid rgb(var(--line-200))" },
  secondary: {
    background: "rgb(var(--white))",
    color: "rgb(var(--teal-800))",
    border: "1px solid rgb(var(--line-200))",
  },
};

export function SiteButton({
  href,
  children,
  size = "md",
  variant = "primary",
  iconAfter = false,
  onClick,
}: ButtonProps) {
  const style: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: size === "lg" ? 56 : 48,
    padding: size === "lg" ? "0 26px" : "0 20px",
    borderRadius: "var(--radius-pill)",
    fontFamily: "var(--font-body)",
    fontSize: size === "lg" ? 18 : 17,
    fontWeight: 700,
    cursor: "pointer",
    textDecoration: "none",
    transition: "background 200ms cubic-bezier(.16,1,.3,1)",
    ...BUTTON_VARIANT[variant],
  };

  const className =
    variant === "primary"
      ? styles.btnPrimary
      : variant === "ghost"
        ? styles.btnGhost
        : styles.btnSecondary;

  const content = (
    <>
      {children}
      {iconAfter && <ArrowRight size={18} aria-hidden="true" />}
    </>
  );

  // In-page jumps (#how) stay plain anchors so they don't push a route.
  if (href.startsWith("#")) {
    return (
      <a href={href} onClick={onClick} className={className} style={style}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={className} style={style}>
      {content}
    </Link>
  );
}

/* ---------- Eyebrow ---------- */

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: ".1em",
        textTransform: "uppercase",
        color: "rgb(var(--teal-700))",
        marginBottom: 14,
      }}
    >
      {children}
    </div>
  );
}

/* ---------- Progress bar ---------- */

export function ProgressBar({ percent, label }: { percent: number; label: string }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      style={{
        height: 10,
        width: "100%",
        borderRadius: "var(--radius-pill)",
        background: "var(--progress-track)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${percent}%`,
          borderRadius: "var(--radius-pill)",
          background: "var(--progress-fill)",
        }}
      />
    </div>
  );
}

/* ---------- Status chip ---------- */

const CHIP: Record<string, { bg: string; line: string; fg: string }> = {
  plan: { bg: "rgb(var(--ok-100))", line: "rgb(var(--ok-200))", fg: "rgb(var(--ok-600))" },
  waiting: { bg: "rgb(var(--info-100))", line: "rgb(var(--info-200))", fg: "rgb(var(--info-600))" },
  todo: { bg: "rgb(var(--warn-100))", line: "rgb(var(--warn-200))", fg: "rgb(var(--warn-600))" },
};

export function StatusChip({ label, state }: { label: string; state: "plan" | "waiting" | "todo" }) {
  const c = CHIP[state];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        alignSelf: "flex-start",
        background: c.bg,
        border: `1px solid ${c.line}`,
        color: c.fg,
        borderRadius: "var(--radius-pill)",
        padding: "5px 12px",
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      <span
        aria-hidden="true"
        style={{ width: 8, height: 8, borderRadius: "999px", background: "currentColor" }}
      />
      {label}
    </span>
  );
}

/* ---------- Form field ---------- */

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        style={{
          display: "block",
          fontSize: 15,
          fontWeight: 700,
          color: "rgb(var(--ink-900))",
          marginBottom: hint ? 2 : 8,
        }}
      >
        {label}
      </label>
      {hint && (
        <p style={{ fontSize: 14, color: "rgb(var(--ink-500))", margin: "0 0 8px" }}>{hint}</p>
      )}
      {children}
    </div>
  );
}

/* ---------- Header (the "centred links" nav) ---------- */

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/feedback", label: "Feedback" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const { pathname } = useRouter();
  const [open, setOpen] = useState(false);

  // Close on arrival: tapping a link shouldn't leave the menu hanging open.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Escape closes it, the way every other menu on the web does.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      style={{
        position: "relative",
        zIndex: 5,
        background: "rgb(var(--white))",
        borderBottom: "1px solid rgb(var(--line-200))",
      }}
    >
      <div className={styles.headerInner}>
        <Link
          href="/"
          className={styles.headerBrand}
          style={{ display: "flex", alignItems: "center", minHeight: 48 }}
        >
          <Logo size={30} />
          <span className="sr-only">Mirian home</span>
        </Link>

        {/* Phone: one button, and the whole menu underneath it. */}
        <button
          type="button"
          className={styles.menuButton}
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen((wasOpen) => !wasOpen)}
        >
          {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          {open ? "Close" : "Menu"}
        </button>

        {/* Desktop: the centred links from the design. */}
        <nav aria-label="Site" className={styles.headerNav}>
          {NAV_LINKS.map((link) => {
            const current = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={current ? "page" : undefined}
                className={styles.navLink}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 17,
                  padding: "12px 16px",
                  minHeight: 48,
                  display: "inline-flex",
                  alignItems: "center",
                  borderRadius: "var(--radius-pill)",
                  textDecoration: "none",
                  transition: "background 200ms cubic-bezier(.16,1,.3,1)",
                  color: current ? "rgb(var(--ink-900))" : "rgb(var(--ink-700))",
                  fontWeight: current ? 700 : 400,
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className={styles.headerActions}>
          <SiteButton href="/auth/signup" variant="secondary">
            Create an account
          </SiteButton>
          <SiteButton href="/auth/login" iconAfter>
            Sign in
          </SiteButton>
        </div>
      </div>

      {open && (
        <nav id="site-menu" aria-label="Site" className={styles.menuPanel}>
          {NAV_LINKS.map((link) => {
            const current = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={current ? "page" : undefined}
                className={`${styles.menuLink} ${current ? styles.menuCurrent : ""}`}
              >
                {link.label}
              </Link>
            );
          })}

          <div className={styles.menuActions}>
            <SiteButton href="/auth/signup" size="lg" variant="secondary">
              Create an account
            </SiteButton>
            <SiteButton href="/auth/login" size="lg" iconAfter>
              Sign in
            </SiteButton>
          </div>
        </nav>
      )}
    </header>
  );
}

/* ---------- Footer ---------- */

export function SiteFooter() {
  return (
    <footer style={{ background: "rgb(var(--white))", borderTop: "1px solid rgb(var(--line-200))" }}>
      <div
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "52px 24px 40px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
          gap: 36,
          alignItems: "start",
        }}
      >
        <div>
          <Logo size={30} />
          <p style={{ fontSize: 16, color: "rgb(var(--ink-500))", margin: "16px 0 0", maxWidth: "34ch" }}>
            Track what you owe. Celebrate what you&rsquo;ve paid. Watch it all get smaller.
          </p>
        </div>

        <nav
          aria-label="Footer"
          style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: ".1em",
              textTransform: "uppercase",
              color: "rgb(var(--ink-500))",
              marginBottom: 8,
            }}
          >
            Pages
          </div>
          {[
            ...NAV_LINKS,
            { href: "/auth/signup", label: "Create an account" },
            { href: "/auth/login", label: "Sign in" },
            { href: "/privacy", label: "Privacy notice" },
          ].map(
            (link) => (
              <Link
                key={link.href}
                href={link.href}
                className={styles.footerLink}
                style={{
                  padding: "6px 0",
                  fontSize: 16,
                  color: "rgb(var(--teal-700))",
                  minHeight: 44,
                  display: "inline-flex",
                  alignItems: "center",
                  textDecoration: "none",
                }}
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: ".1em",
              textTransform: "uppercase",
              color: "rgb(var(--ink-500))",
              marginBottom: 8,
            }}
          >
            About
          </div>
          <p style={{ fontSize: 16, color: "rgb(var(--ink-500))", margin: 0, maxWidth: "32ch" }}>
            Mirian is Sindarin for a Gondorian coin. A small thing, counted carefully.
          </p>
        </div>
      </div>

      <div style={{ borderTop: "1px solid rgb(var(--line-100))" }}>
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            padding: "20px 24px",
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
            fontSize: 15,
            color: "rgb(var(--ink-500))",
          }}
        >
          <span>© {new Date().getFullYear()} Mirian</span>
          <span>Built by Sael North</span>
        </div>
      </div>
    </footer>
  );
}

/* ---------- Page shell ---------- */

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "rgb(var(--paper))",
        color: "rgb(var(--ink-700))",
        fontFamily: "var(--font-body)",
        fontSize: 17,
        lineHeight: 1.55,
      }}
    >
      <SiteHeader />
      <main style={{ flex: 1 }}>{children}</main>
      <SiteFooter />
    </div>
  );
}
