"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Cloudflare Turnstile, on the three forms that make Supabase send email.
 *
 * Why this and not a puzzle: Turnstile is usually invisible — it watches the
 * browser rather than asking the person to identify traffic lights, which is
 * the kind of test that falls hardest on exactly the people Mirian is for.
 *
 * Why at all, when the app already has a honeypot and rate limits: the
 * Supabase anon key ships inside the browser bundle, so a script can call
 * Supabase's own signup endpoint and never touch `pages/api` at all. That is
 * almost certainly what happened in September. Supabase checks the Turnstile
 * token itself, which is the only defence sitting at the door that was
 * actually being used.
 *
 * Until NEXT_PUBLIC_TURNSTILE_SITE_KEY is set this renders nothing and reports
 * no token, so the app behaves exactly as it does today.
 */

export const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || "";

export const turnstileEnabled = () => TURNSTILE_SITE_KEY.length > 0;

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Turnstile failed to load"));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export default function Turnstile({
  onToken,
  resetKey = 0,
}: {
  /** Called with a token when the check passes, and "" when it expires. */
  onToken: (token: string) => void;
  /**
   * Bump this to make the widget run again. A token is good for exactly one
   * attempt, so after any failed submission the page needs a fresh one —
   * without this the form sits there waiting for a token that never comes.
   */
  resetKey?: number;
}) {
  const holder = useRef<HTMLDivElement | null>(null);
  const widgetId = useRef<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!turnstileEnabled() || !holder.current) return;
    let cancelled = false;

    loadScript()
      .then(() => {
        if (cancelled || !holder.current || !window.turnstile) return;
        // Guard against React running the effect twice in strict mode.
        if (widgetId.current) return;
        widgetId.current = window.turnstile.render(holder.current, {
          sitekey: TURNSTILE_SITE_KEY,
          theme: "auto",
          callback: (token: string) => onToken(token),
          "expired-callback": () => onToken(""),
          "error-callback": () => {
            onToken("");
            setFailed(true);
          },
        });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
    // onToken is a setter from the page; re-running on every render would
    // tear the widget down mid-check.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!resetKey || !widgetId.current || !window.turnstile) return;
    onToken("");
    window.turnstile.reset(widgetId.current);
    // onToken is a setter; including it would reset on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  if (!turnstileEnabled()) return null;

  return (
    <div>
      <div ref={holder} />
      {failed && (
        <p className="text-sm text-warn-600 mt-2">
          The security check couldn&rsquo;t load. Refreshing the page usually
          sorts it — and if it doesn&rsquo;t, do get in touch and we&rsquo;ll
          help you in another way.
        </p>
      )}
    </div>
  );
}
