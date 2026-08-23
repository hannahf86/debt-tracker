/**
 * Client-safe dev flags. Kept separate from lib/devAuth.ts so the browser
 * bundle never pulls in next-auth server internals or the Supabase admin client.
 *
 * NEXT_PUBLIC_DEV_NO_AUTH is inlined at build time by Next, and the NODE_ENV
 * guard means this can never be true in a production build.
 */
export const DEV_NO_AUTH =
  process.env.NODE_ENV !== "production" &&
  process.env.NEXT_PUBLIC_DEV_NO_AUTH === "true";

export const DEV_EMAIL = "demo@mirian.local";
