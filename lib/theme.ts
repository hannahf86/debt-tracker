export type Theme = "light" | "dark" | "system";

export const THEME_KEY = "mirian-theme";

/** Colours the browser chrome to match, so the notch area doesn't clash. */
const THEME_COLOR = { light: "#1a666a", dark: "#0b181a" };

export function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme !== "system") return theme;
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;

  // "system" means express no preference, so the media query in dark.css
  // decides. Any other value pins it.
  if (theme === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", theme);

  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", THEME_COLOR[resolveTheme(theme)]);

  try {
    if (theme === "system") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Private browsing can refuse storage; the theme still applies for now.
  }
}

export function readTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // ignore
  }
  return "system";
}

// The before-first-paint theme script lives in public/theme-init.js, loaded
// from _document. It was inline, which a Content-Security-Policy can only allow
// by permitting all inline scripts. If THEME_KEY changes, change it there too.
