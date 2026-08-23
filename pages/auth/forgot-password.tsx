"use client";

import { useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // The API answers 200 either way, so there's nothing to branch on here.
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => {});

    setIsLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-page-accent flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <img src="/mark.svg" alt="" className="h-14 w-14 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-sage-800 mb-2">Mirian</h1>
        </div>

        <div className="bg-white border border-mint-200 rounded-2xl p-8 shadow-sm">
          {sent ? (
            <div className="text-center">
              <div className="flex items-center justify-center w-14 h-14 mx-auto mb-5 rounded-pill bg-teal-50 text-brand">
                <MailCheck size={26} />
              </div>
              <h2 className="text-xl font-semibold text-sage-800 mb-3">
                Check your inbox
              </h2>
              <p className="text-sage-600 text-sm mb-6">
                If there&rsquo;s an account for that address, a reset link is on
                its way. It expires after an hour — if it does, just ask for
                another one.
              </p>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center w-full min-h-[48px] rounded-pill border border-mint-200 text-sage-700 hover:bg-mint-100 text-sm font-semibold transition-colors duration-base"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-sage-800 mb-2">
                Forgot your password?
              </h2>
              <p className="text-sage-600 text-sm mb-6">
                Happens to everyone. Pop your email in and we&rsquo;ll send you
                a link to set a new one.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="text-xs text-sage-600 uppercase tracking-wider font-semibold block mb-2"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-white border border-mint-200 rounded-lg px-4 py-2 text-sage-800 placeholder-sage-500 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-sage-600 hover:bg-sage-700 text-white font-medium min-h-[48px] rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                >
                  {isLoading ? "Sending…" : "Send reset link"}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-mint-200">
                <p className="text-sage-600 text-sm text-center">
                  Remembered it?{" "}
                  <Link
                    href="/auth/login"
                    className="text-sage-700 hover:text-sage-900 transition-colors font-semibold"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
