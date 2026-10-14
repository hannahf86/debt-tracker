"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

/**
 * A tip you only need to read once.
 *
 * Shown until someone dismisses it, then never again on that device. The
 * choice lives in localStorage rather than the database on purpose: it isn't
 * worth a column, it isn't worth a request, and nobody needs their reading
 * habits recorded on a server.
 *
 * It starts hidden and appears after mount, because the answer is only known
 * in the browser — rendering it on the server and hiding it a moment later
 * would flash at exactly the people least able to ignore a flash.
 */
export default function DismissibleHint({
  id,
  children,
  className = "",
}: {
  /** Remembered under this name, so each tip is dismissed on its own. */
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [show, setShow] = useState(false);
  const key = `mirian.hint.${id}`;

  useEffect(() => {
    try {
      if (localStorage.getItem(key) !== "dismissed") setShow(true);
    } catch {
      // Private browsing, or storage turned off. Showing the tip is the safe
      // way to fail: a hint nobody can dismiss beats no hint at all.
      setShow(true);
    }
  }, [key]);

  if (!show) return null;

  return (
    <div className={`flex items-start gap-2 ${className}`}>
      <p className="text-xs text-sage-800 flex-1">{children}</p>
      <button
        type="button"
        onClick={() => {
          setShow(false);
          try {
            localStorage.setItem(key, "dismissed");
          } catch {
            // Can't remember it? It still goes away for now.
          }
        }}
        aria-label="Hide this tip"
        className="shrink-0 -mt-1 -mr-1 flex items-center justify-center w-8 h-8 rounded-lg text-sage-500 hover:text-sage-800 hover:bg-mint-100 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}
