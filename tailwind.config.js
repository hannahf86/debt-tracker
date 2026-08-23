/** @type {import('tailwindcss').Config} */

// Mirian design system — see styles/tokens/*.css for the source of truth.
//
// Colours resolve through CSS variables holding RGB channels, so a single
// theme swap in tokens/dark.css reaches every utility without dark: variants.
// The <alpha-value> placeholder keeps opacity modifiers (bg-brand/20) working.
//
// The `sage` / `mint` / `peach` scales are ALIASES kept from the pre-refresh
// palette: the app has hundreds of classes using those names, and repointing
// the scale applied the refresh everywhere at once. New work should prefer the
// semantic names (brand, ink, line, paper, surface…).

const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

const ramp = (prefix, stops) =>
  Object.fromEntries(stops.map((n) => [n, v(`${prefix}-${n}`)]));

const teal = ramp("teal", [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]);
const ink = ramp("ink", [400, 500, 700, 900]);
const line = ramp("line", [100, 200, 300]);
const ice = ramp("ice", [50, 100, 200]);
const sky = ramp("sky", [300, 500, 600, 700]);

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

        // Card surface. bg-white resolves here so cards theme correctly.
        white: v("white"),
        paper: { DEFAULT: v("paper"), sunk: v("paper-sunk") },
        surface: v("white"),

        brand: {
          DEFAULT: v("teal-700"),
          hover: v("teal-800"),
          active: v("teal-900"),
          soft: v("teal-100"),
          "soft-hover": v("teal-200"),
        },

        ok: ramp("ok", [100, 200, 600, 700]),
        warn: ramp("warn", [100, 200, 600, 700]),
        alert: ramp("alert", [100, 200, 600, 700]),
        now: ramp("now", [100, 200, 600, 700]),
        info: ramp("info", [100, 200, 600, 700]),

        // --- Legacy aliases -------------------------------------------------
        sage: {
          50: teal[50],
          100: teal[100],
          200: teal[200],
          300: ink[400],
          400: ink[400],
          500: ink[500],
          600: v("teal-700"),
          700: v("teal-800"),
          800: ink[900],
          900: ink[900],
          950: teal[950],
        },
        mint: { 100: line[100], 200: line[200], 300: line[300] },
        peach: {
          50: ice[50],
          100: v("paper"),
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
