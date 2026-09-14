import { useState, useEffect, useCallback } from "react";
import type { ContactLog, ContactMethod } from "@/lib/types";

export type NewContact = {
  template: string;
  method: ContactMethod;
  subject: string | null;
  body: string;
};

/** A debt's contact history, and a way to add to it. */
export function useContacts(debtId: string | null) {
  const [contacts, setContacts] = useState<ContactLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = useCallback(async () => {
    if (!debtId) return;
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/contacts?debtId=${encodeURIComponent(debtId)}`,
      );
      if (!response.ok) throw new Error("Failed to load contact history");
      setContacts(await response.json());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [debtId]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const logContact = useCallback(
    async (entry: NewContact): Promise<ContactLog> => {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ debt_id: debtId, ...entry }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "We couldn't save that. Please try again.");
      }
      const saved: ContactLog = await response.json();
      setContacts((current) => [saved, ...current]);
      setError(null);
      return saved;
    },
    [debtId],
  );

  return { contacts, isLoading, error, fetchContacts, logContact };
}
