"use client";

import { useState } from "react";
import { ExternalLink, Search } from "lucide-react";
import type { Creditor } from "@/lib/types";
import { helpPageLabel } from "@/lib/creditors";
import CreditorPicker from "@/components/CreditorPicker";

/**
 * Sits under the company name in the debt forms: "Find how to contact them"
 * until a company is picked, then a link to its help page.
 */
export default function CreditorField({
  creditor,
  onChange,
}: {
  creditor: Creditor | null;
  onChange: (creditor: Creditor | null) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-2">
      {creditor ? (
        /* Linked company */
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <a
            href={creditor.support_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 min-h-[40px] text-sm font-semibold text-brand hover:underline"
          >
            {helpPageLabel(creditor)}
            <ExternalLink size={14} aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="min-h-[40px] text-xs font-semibold text-sage-500 hover:text-sage-700"
          >
            Remove
          </button>
        </div>
      ) : (
        /* Way into the picker */
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1.5 min-h-[40px] text-sm font-semibold text-brand hover:underline"
        >
          <Search size={15} aria-hidden="true" />
          Find how to contact them
        </button>
      )}

      {isOpen && (
        <CreditorPicker
          onClose={() => setIsOpen(false)}
          onPick={(picked) => {
            onChange(picked);
            setIsOpen(false);
          }}
        />
      )}
    </div>
  );
}
