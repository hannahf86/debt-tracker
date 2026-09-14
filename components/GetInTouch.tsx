"use client";

import { useId, useState } from "react";
import type { ContactLog, Debt } from "@/lib/types";
import type { NewContact } from "@/lib/hooks/useContacts";
import { describeContact } from "@/lib/templates";
import ContactModal, { type SaveDetails } from "@/components/ContactModal";
import AdviceLinks from "@/components/AdviceLinks";

/**
 * "It's always best to let them know" — the way into writing to a creditor,
 * and the history of what's already been sent.
 */
export default function GetInTouch({
  debt,
  contacts,
  isLoading,
  error,
  yourName,
  onLogged,
  onSaveDetails,
  compact = false,
}: {
  debt: Debt;
  contacts: ContactLog[];
  isLoading: boolean;
  error: string | null;
  yourName: string;
  onLogged: (entry: NewContact) => Promise<ContactLog>;
  onSaveDetails: SaveDetails;
  /** Tighter padding for the phone layout. */
  compact?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className={`bg-white border border-mint-200 shadow-sm ${
        compact ? "rounded-xl p-4" : "rounded-2xl p-6"
      }`}
    >
      {/* Heading and way in */}
      <h2 id={headingId} className="text-lg font-semibold text-sage-800">
        It&rsquo;s always best to let them know
      </h2>
      <p className="text-sm text-sage-600 mt-1">
        Pick what you want to say and we&rsquo;ll write the message for you.
      </p>
      <button
        onClick={() => setIsOpen(true)}
        className="mt-4 w-full sm:w-auto min-h-[48px] px-5 rounded-pill border border-brand text-brand bg-white hover:bg-brand-soft font-semibold text-sm transition-colors"
      >
        Get in touch with {debt.company}
      </button>

      {/* Contact history */}
      <div className="mt-6">
        <h3 className="caps-label mb-2">Your contact history</h3>
        {isLoading ? (
          <p className="text-sm text-sage-500">Loading…</p>
        ) : error ? (
          <p className="text-sm text-sage-500">
            We couldn&rsquo;t load your contact history just now.
          </p>
        ) : contacts.length === 0 ? (
          <p className="text-sm text-sage-500">
            Nothing yet. When you send a message from here, we&rsquo;ll keep a note
            of it for you.
          </p>
        ) : (
          <ul>
            {contacts.map((contact) => (
              <li
                key={contact.id}
                className="py-3 border-b border-mint-100 last:border-b-0"
              >
                <p className="text-sm text-sage-800">
                  {describeContact(contact, debt.company)}
                </p>
                <details className="mt-1">
                  <summary className="text-xs font-semibold text-brand cursor-pointer min-h-[32px] inline-flex items-center">
                    See what you sent
                  </summary>
                  <p className="mt-2 text-sm text-sage-700 whitespace-pre-wrap bg-paper-sunk rounded-lg p-3">
                    {contact.body}
                  </p>
                </details>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AdviceLinks className="mt-5" />

      {isOpen && (
        <ContactModal
          debt={debt}
          yourName={yourName}
          onClose={() => setIsOpen(false)}
          onLogged={onLogged}
          onSaveDetails={onSaveDetails}
        />
      )}
    </section>
  );
}
