/**
 * Security headers for every response.
 *
 * The Content-Security-Policy is ENFORCED as of 2026-09-23. It ran in
 * report-only mode first, and a click through the public pages and the sign-in
 * screens with it enforcing produced no violations. Everything the app loads —
 * scripts, fonts, images — comes from this origin; the only outside connection
 * is Supabase, which the reset-password page talks to directly.
 *
 * If something ever breaks with "Refused to..." in the console, the fix is to
 * name the source it's asking for, not to widen a directive to a wildcard.
 */
const isProd = process.env.NODE_ENV === "production";

const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self'",
  // React writes style attributes (progress bars, sizes), which count as inline.
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  // Fonts are self-hosted, so nothing is fetched from Google.
  "font-src 'self'",
  // The reset-password page talks to Supabase auth from the browser.
  "connect-src 'self' https://*.supabase.co",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  // The data download builds a PDF in the browser and hands it over as a
  // blob; some browsers route that through a frame.
  "frame-src 'self' blob:",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Nobody can put the app in a frame and trick people into clicking it.
  { key: "X-Frame-Options", value: "DENY" },
  // Links out to company help pages don't carry the page address with them.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ...(isProd
    ? [{ key: "Content-Security-Policy", value: contentSecurityPolicy }]
    : []),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Don't advertise the framework in a response header.
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      // Personal data must never be kept in a shared or browser cache.
      { source: "/api/(.*)", headers: [{ key: "Cache-Control", value: "no-store" }] },
      /* Keep the signed-in app out of search results twice over: the pages
         carry a noindex tag, and these send the same instruction in the
         response header, which a crawler sees without parsing any HTML.
         Only these paths — the public pages must stay indexable. */
      ...[
        "/dashboard",
        "/debts/:path*",
        "/tracker/:path*",
        "/settings/:path*",
        "/onboarding",
        "/auth/:path*",
        "/api/:path*",
      ].map((source) => ({
        source,
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      })),
    ];
  },
};

module.exports = nextConfig;
