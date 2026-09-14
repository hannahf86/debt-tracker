/*
 * Applies the saved light/dark theme before first paint, so the page doesn't
 * flash light and snap to dark.
 *
 * A file rather than an inline script so the Content-Security-Policy can allow
 * scripts from 'self' only. Must stay in step with THEME_KEY in lib/theme.ts.
 */
(function () {
  try {
    var t = localStorage.getItem("mirian-theme");
    if (t === "dark" || t === "light") {
      document.documentElement.setAttribute("data-theme", t);
    }
  } catch (e) {}
})();
