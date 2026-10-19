"use client";

import { useEffect, useRef, useState } from "react";
import { Download, PartyPopper } from "lucide-react";
import type { Debt, Payment } from "@/lib/types";
import {
  buildCertificate,
  certificateAlt,
  drawCertificate,
} from "@/lib/certificate";

/**
 * A debt that's gone, said properly.
 *
 * Shown on the debt's own page once the balance reaches zero. The words here
 * and the words in the downloaded picture come from the same place, so what
 * somebody sees is what they get.
 *
 * What it says depends on one preference, set in Settings: whether to name the
 * company and show the figures. It is off unless somebody turns it on. A
 * certificate reading "Barclaycard: gone, £3,240" is lovely on a fridge and
 * risky in a group chat, and some people are hiding a debt from somebody who
 * controls the money. The safe version is the one you get without thinking.
 */
export default function Certificate({
  debt,
  payments,
  showDetails,
}: {
  debt: Debt;
  payments: Payment[];
  /** From the profile. Defaults to false everywhere it's read. */
  showDetails: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [saving, setSaving] = useState(false);
  const data = buildCertificate(debt, payments, showDetails);

  // Draw whenever the words change, so the download matches what's on screen.
  useEffect(() => {
    if (canvasRef.current) drawCertificate(canvasRef.current, data);
    // The data object is rebuilt each render; its contents are what matter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.headline, data.body, data.paymentCount, data.startedLabel]);

  const download = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setSaving(true);
    try {
      await drawCertificate(canvas, data);
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      link.download = `${showDetails ? debt.company.toLowerCase().replace(/\s+/g, "-") : "debt"}-cleared.png`;
      link.click();
    } finally {
      setSaving(false);
    }
  };

  return (
    <section
      aria-label="Debt cleared"
      className="bg-white border border-mint-200 rounded-2xl p-6 shadow-sm"
    >
      <div className="flex items-start gap-3 mb-4">
        <span className="flex items-center justify-center w-10 h-10 shrink-0 rounded-xl bg-ok-100 border border-ok-200 text-ok-600">
          <PartyPopper size={20} aria-hidden="true" />
        </span>
        <div>
          <p className="caps-label">{data.eyebrow}</p>
          <h2 className="font-display text-2xl font-extrabold text-sage-800 mt-1">
            {data.headline}
          </h2>
        </div>
      </div>

      <p className="text-sage-700 text-base leading-relaxed">{data.body}</p>

      <dl className="flex flex-wrap gap-x-10 gap-y-3 mt-5 pt-5 border-t border-mint-200">
        <div>
          <dt className="caps-label">Started</dt>
          <dd className="font-display text-lg font-bold text-sage-800">
            {data.startedLabel}
          </dd>
        </div>
        <div>
          <dt className="caps-label">Payments</dt>
          <dd className="font-display text-lg font-bold text-sage-800">
            {data.paymentCount}
          </dd>
        </div>
        {data.paidOff !== null && (
          <div>
            <dt className="caps-label">Paid off</dt>
            <dd className="font-display text-lg font-bold text-sage-800">
              £{Math.round(data.paidOff).toLocaleString()}
            </dd>
          </div>
        )}
        <div>
          <dt className="caps-label">Still owed</dt>
          <dd className="font-display text-lg font-bold text-ok-600">£0</dd>
        </div>
      </dl>

      <div className="flex flex-wrap items-center gap-3 mt-5">
        <button
          onClick={download}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 min-h-[48px] px-5 rounded-pill bg-sage-600 hover:bg-sage-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
        >
          <Download size={16} aria-hidden="true" />
          {saving ? "Saving…" : "Save as a picture"}
        </button>
        <p className="text-xs text-sage-500">
          {showDetails
            ? "This one names the company and the amount. Change that in Settings."
            : "The company and the amount are hidden. You can show them in Settings."}
        </p>
      </div>

      {/* Drawn off-screen, then saved. Described for anyone who can't see it. */}
      <canvas
        ref={canvasRef}
        className="sr-only"
        aria-label={certificateAlt(data)}
      />
    </section>
  );
}
