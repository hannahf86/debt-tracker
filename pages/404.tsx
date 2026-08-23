"use client";

import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-page-accent flex items-center justify-center p-6">
      <div className="w-full max-w-narrow text-center">
        <img src="/mark.svg" alt="" className="h-14 w-14 mx-auto mb-6" />

        <div className="bg-white border border-mint-200 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center justify-center w-14 h-14 mx-auto mb-5 rounded-pill bg-teal-50 text-brand">
            <Compass size={26} />
          </div>

          <p className="caps-label mb-3">Page not found</p>

          <h1 className="font-display text-2xl font-bold text-sage-800 mb-3">
            This page has wandered off
          </h1>

          <p className="text-sage-600 mb-8">
            Nothing&rsquo;s broken and nothing&rsquo;s lost — the link just
            doesn&rsquo;t go anywhere. Let&rsquo;s get you back to something
            useful.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-6 min-h-[48px] rounded-pill bg-brand hover:bg-brand-hover text-white text-sm font-semibold transition-colors duration-base"
            >
              Back to dashboard
            </Link>
            <Link
              href="/debts"
              className="inline-flex items-center justify-center px-6 min-h-[48px] rounded-pill border border-mint-200 text-sage-700 hover:bg-mint-100 text-sm font-semibold transition-colors duration-base"
            >
              See your debts
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
