"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, Search } from "lucide-react";
import type { Creditor, CreditorCategory } from "@/lib/types";
import { CREDITOR_CATEGORIES, categoryLabel } from "@/lib/creditors";

type Status = "idle" | "loading" | "done" | "error";

/**
 * Find how to contact a company: pick what kind of company it is, then search
 * by name. Results only appear once you start typing — no long list to wade
 * through.
 *
 * Rendered in a portal because it opens from inside the add-debt form: a
 * button or an Enter keypress in here must never submit that form.
 */
export default function CreditorPicker({
  onPick,
  onClose,
}: {
  onPick: (creditor: Creditor) => void;
  onClose: () => void;
}) {
  const [category, setCategory] = useState<CreditorCategory | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Creditor[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  const isCouncilTax = category === "council_tax";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Search after a short pause in typing. Council tax has nothing to search —
  // it's one GOV.UK page — so it loads as soon as it's picked.
  useEffect(() => {
    if (!category) return;
    const term = query.trim();

    if (!isCouncilTax && !term) {
      setResults([]);
      setStatus("idle");
      return;
    }

    let cancelled = false;
    setStatus("loading");

    const timer = setTimeout(
      async () => {
        try {
          const params = new URLSearchParams({ category });
          if (term) params.set("q", term);
          const response = await fetch(`/api/creditors?${params}`);
          if (!response.ok) throw new Error("search failed");
          const data: Creditor[] = await response.json();
          if (!cancelled) {
            setResults(data);
            setStatus("done");
          }
        } catch {
          if (!cancelled) {
            setResults([]);
            setStatus("error");
          }
        }
      },
      isCouncilTax ? 0 : 200,
    );

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [category, query, isCouncilTax]);

  useEffect(() => {
    if (category && !isCouncilTax) inputRef.current?.focus();
  }, [category, isCouncilTax]);

  const chooseCategory = (value: CreditorCategory) => {
    setCategory(value);
    setQuery("");
    setResults([]);
    setStatus("idle");
  };

  const term = query.trim();

  const sheet = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Find how to contact them"
      className="fixed inset-0 z-[60] md:bg-sage-900/40 md:backdrop-blur-sm flex md:items-center md:justify-center md:p-4"
      onClick={onClose}
    >
      <div
        className="w-full min-w-0 max-w-full h-[100dvh] md:h-auto flex flex-col md:block md:max-w-md md:max-h-[calc(100dvh-2rem)] overflow-x-hidden overflow-y-auto bg-white md:border md:border-mint-200 md:rounded-2xl p-5 md:p-6 md:shadow-modal pb-[max(1.25rem,env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-5 shrink-0">
          <div className="min-w-0 flex items-start gap-1">
            {category && (
              <button
                type="button"
                onClick={() => setCategory(null)}
                aria-label="Back to kinds of company"
                className="flex items-center justify-center w-11 h-11 -ml-3 rounded-xl text-sage-500 hover:bg-mint-100 transition-colors shrink-0"
              >
                <ChevronLeft size={22} />
              </button>
            )}
            <div className="min-w-0">
              <h3 className="text-xl font-bold text-sage-800">
                {category ? categoryLabel(category) : "What kind of company is it?"}
              </h3>
              <p className="text-sm text-sage-500 mt-0.5">
                Find how to contact them
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex items-center justify-center w-11 h-11 -mr-2 rounded-xl text-sage-500 hover:bg-mint-100 transition-colors shrink-0"
          >
            <X size={22} />
          </button>
        </div>

        {!category ? (
          /* Step 1: what kind of company */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {CREDITOR_CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => chooseCategory(c.value)}
                className="min-h-[56px] px-4 py-3 bg-white border border-mint-200 hover:border-sage-300 active:bg-mint-100 rounded-xl text-left text-sage-800 text-sm font-medium transition-colors"
              >
                {c.label}
              </button>
            ))}
          </div>
        ) : (
          /* Step 2: search by name */
          <div className="space-y-4">
            {isCouncilTax ? (
              <p className="text-sm text-sage-600">
                Council tax is run by your local council, so there isn&rsquo;t
                one company to contact. This GOV.UK page explains what to do if
                you can&rsquo;t pay, and how to find your council.
              </p>
            ) : (
              <div className="relative">
                <label htmlFor="creditor-search" className="sr-only">
                  Company name
                </label>
                <Search
                  size={18}
                  aria-hidden="true"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-500 pointer-events-none"
                />
                <input
                  ref={inputRef}
                  id="creditor-search"
                  type="search"
                  autoComplete="off"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.preventDefault();
                  }}
                  placeholder="Start typing their name"
                  className="w-full min-h-[52px] bg-white border border-mint-200 rounded-lg pl-11 pr-4 py-2 text-sage-800 placeholder-sage-500 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand"
                />
              </div>
            )}

            {/* Results — announced as they change */}
            <div aria-live="polite">
              {status === "idle" && !isCouncilTax && (
                <p className="text-sm text-sage-500">
                  Start typing and matching companies will appear here.
                </p>
              )}
              {status === "loading" && (
                <p className="text-sm text-sage-500">Searching…</p>
              )}
              {status === "error" && (
                <p className="text-sm text-sage-500">
                  We couldn&rsquo;t search just now. You can still type their
                  details in yourself.
                </p>
              )}
              {status === "done" && results.length === 0 && (
                <p className="text-sm text-sage-500">
                  We don&rsquo;t have &ldquo;{term}&rdquo; yet. You can still add
                  their details yourself.
                </p>
              )}
              {status === "done" && results.length > 0 && (
                <ul className="space-y-2.5">
                  {results.map((creditor) => (
                    <li key={creditor.id}>
                      <button
                        type="button"
                        onClick={() => onPick(creditor)}
                        className="w-full min-h-[56px] px-4 py-3 bg-white border border-mint-200 hover:border-sage-300 active:bg-mint-100 rounded-xl text-left transition-colors"
                      >
                        <span className="block text-sage-800 text-sm font-semibold">
                          {creditor.name}
                        </span>
                        <span className="block text-xs text-sage-500 mt-0.5">
                          {creditor.email
                            ? "Help page and email address"
                            : "Help page"}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(sheet, document.body);
}
