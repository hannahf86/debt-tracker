"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { AlertCircle } from "lucide-react";

type Status = "checking" | "ready" | "invalid";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Supabase puts the recovery token in the URL and the client swaps it for a
  // short-lived session. Until that lands there's nothing to submit against.
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash.includes("error")) {
      setStatus("invalid");
      return;
    }

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setStatus("ready");
    });

    supabase.auth
      .getSession()
      .then(({ data }) => setStatus(data.session ? "ready" : "invalid"))
      .catch(() => setStatus("invalid"));

    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Please use at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Those two don't match.");
      return;
    }

    setIsSaving(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setIsSaving(false);
      return;
    }

    // Don't leave the recovery session hanging around — the app signs in
    // through NextAuth, not this one.
    await supabase.auth.signOut();
    router.push("/auth/login?message=Password updated. You can sign in now.");
  };

  return (
    <div className="min-h-screen bg-page-accent flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <img src="/mark.svg" alt="" className="h-14 w-14 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-sage-800 mb-2">Mirian</h1>
        </div>

        <div className="bg-white border border-mint-200 rounded-2xl p-8 shadow-sm">
          {status === "checking" && (
            <p className="text-sage-500 text-sm text-center py-4">
              Checking your link…
            </p>
          )}

          {status === "invalid" && (
            <div className="text-center">
              <div className="flex items-center justify-center w-14 h-14 mx-auto mb-5 rounded-pill bg-warn-100 text-warn-600">
                <AlertCircle size={26} />
              </div>
              <h2 className="text-xl font-semibold text-sage-800 mb-3">
                That link has expired
              </h2>
              <p className="text-sage-600 text-sm mb-6">
                Reset links only last an hour. No harm done — ask for a fresh
                one and we&rsquo;ll send it straight over.
              </p>
              <Link
                href="/auth/forgot-password"
                className="inline-flex items-center justify-center w-full min-h-[48px] rounded-pill bg-brand hover:bg-brand-hover text-white text-sm font-semibold transition-colors duration-base"
              >
                Send a new link
              </Link>
            </div>
          )}

          {status === "ready" && (
            <>
              <h2 className="text-xl font-semibold text-sage-800 mb-2">
                Set a new password
              </h2>
              <p className="text-sage-600 text-sm mb-6">
                Pick something you&rsquo;ll recognise. Eight characters or more.
              </p>

              {error && (
                <div className="mb-4 p-4 bg-alert-100 border border-alert-200 rounded-lg">
                  <p className="text-sm text-alert-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="password"
                    className="text-xs text-sage-600 uppercase tracking-wider font-semibold block mb-2"
                  >
                    New password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-mint-200 min-h-[48px] rounded-lg px-4 py-2 text-sage-800 placeholder-sage-500 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirm"
                    className="text-xs text-sage-600 uppercase tracking-wider font-semibold block mb-2"
                  >
                    Once more
                  </label>
                  <input
                    id="confirm"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-mint-200 min-h-[48px] rounded-lg px-4 py-2 text-sage-800 placeholder-sage-500 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-sage-600 hover:bg-sage-700 text-white font-medium min-h-[48px] rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                >
                  {isSaving ? "Saving…" : "Save new password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
