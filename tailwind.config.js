/** @type {import('tailwindcss').Config} */

// Mirian design system — see styles/tokens/*.css for the source of truth.
//
// The `sage` / `mint` / `peach` scales are kept as ALIASES onto the new teal
// palette. The app has ~600 utility classes using those names; repointing the
// scale applies the refresh everywhere at once instead of rewriting each one.
// New work should prefer the semantic names below (brand, ink, line, paper…).
//
// Values are literal hex rather than var() so Tailwind's opacity modifiers
// (e.g. bg-brand/20) keep working.

const teal = {
  50: "#effbfb",
  100: "#d7f3f4",
  200: "#b3e8ea",
  300: "#7fd7da",
  400: "#45bfc4",
  500: "#2a9a9e",
  600: "#217e82",
  700: "#1a666a",
  800: "#154f52",
  900: "#0f3739",
  950: "#0a2526",
};

const ink = {
  900: "#0f2427",
  700: "#3a5254",
  500: "#5b7174",
  400: "#899b9d",
};

const line = {
  100: "#edf3f3",
  200: "#dfeaea",
  300: "#c9d8d9",
};

const ice = { 50: "#f4fcfc", 100: "#dcf4f5", 200: "#c3ebed" };
const sky = { 300: "#8ecfe4", 500: "#3d9dc4", 600: "#2b7fa6", 700: "#22677f" };

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Atkinson Hyperlegible", "Nunito", "system-ui", "sans-serif"],
        display: ["Nunito", "Atkinson Hyperlegible", "system-ui", "sans-serif"],
      },

      // Design-system type scale — deliberately larger than web defaults.
      fontSize: {
        "2xs": ["0.75rem", { lineHeight: "1.3" }],
        xs: ["0.8125rem", { lineHeight: "1.4" }],
        sm: ["0.9375rem", { lineHeight: "1.5" }],
        base: ["1.0625rem", { lineHeight: "1.55" }],
        lg: ["1.25rem", { lineHeight: "1.4" }],
        xl: ["1.5rem", { lineHeight: "1.3" }],
        "2xl": ["1.875rem", { lineHeight: "1.2" }],
        "3xl": ["2.375rem", { lineHeight: "1.15" }],
        "4xl": ["3rem", { lineHeight: "1.15" }],
        "5xl": ["3.75rem", { lineHeight: "1.1" }],
      },

      colors: {
        teal,
        ink,
        line,
        ice,
        sky,
        paper: { DEFAULT: "#f8fbfb", sunk: "#edf3f3" },

        // Semantic action colours
        brand: {
          DEFAULT: teal[700],
          hover: teal[800],
          active: teal[900],
          soft: teal[100],
          "soft-hover": teal[200],
        },

        // Payment / month states — each also carries an icon, never colour alone
        ok: { 100: "#e2f3e9", 200: "#bfe4cd", 600: "#1c7040", 700: "#155733" },
        warn: { 100: "#fdf0da", 200: "#f6dfb4", 600: "#8a5a00", 700: "#6d4700" },
        alert: { 100: "#fceae5", 200: "#f6cec3", 600: "#a8371f", 700: "#872c19" },
        now: { 100: "#fdeddc", 200: "#f7d6b4", 600: "#9a4e13", 700: "#7c3e0f" },
        info: { 100: "#eceafa", 200: "#d5d1f3", 600: "#4f46b8", 700: "#3e3793" },

        // --- Legacy aliases -------------------------------------------------
        // sage was the old green ramp: 800/900 headings, 600 action fill,
        // 700 action hover, 500 muted text, 400/300 faint + placeholders.
        sage: {
          50: teal[50],
          100: teal[100],
          200: teal[200],
          300: ink[400], // placeholders
          400: ink[400], // faint text
          500: ink[500], // muted text
          600: teal[700], // primary action fill
          700: teal[800], // action hover / strong text
          800: ink[900], // headings
          900: ink[900],
          950: teal[950],
        },
        // mint was hairlines and card borders
        mint: { 100: line[100], 200: line[200], 300: line[300] },
        // peach was the warm page gradient — now cool paper/ice
        peach: {
          50: ice[50],
          100: "#f8fbfb",
          200: ice[100],
          300: ice[100],
          400: ice[200],
          500: ice[200],
          600: sky[300],
          700: sky[500],
          800: sky[600],
          900: sky[700],
        },
      },

      borderRadius: {
        sm: "6px",
        DEFAULT: "10px",
        md: "12px",
        lg: "16px",
        xl: "20px", // default card
        "2xl": "28px", // hero panels
        pill: "999px", // progress bars, chips, pill buttons
      },

      boxShadow: {
        sm: "0 1px 2px rgba(15,36,39,.05),0 1px 1px rgba(15,36,39,.04)",
        DEFAULT: "0 1px 2px rgba(15,36,39,.05),0 1px 1px rgba(15,36,39,.04)",
        md: "0 2px 6px rgba(15,36,39,.06),0 8px 20px rgba(15,36,39,.05)",
        lg: "0 12px 32px rgba(15,36,39,.10)",
        modal: "0 24px 60px rgba(15,36,39,.22)",
        focus: "0 0 0 3px rgba(42,154,158,.34)",
      },

      transitionTimingFunction: {
        out: "cubic-bezier(.16,1,.3,1)",
        standard: "cubic-bezier(.2,0,.2,1)",
      },

      transitionDuration: {
        fast: "120ms",
        base: "200ms",
        slow: "320ms",
      },

      maxWidth: {
        content: "1120px",
        narrow: "560px",
      },
    },
  },
  plugins: [],
};
