import { useCallback, useEffect, useState } from "react";
import type { Entitlement } from "@/lib/entitlement";

/**
 * Where this account stands with the free period.
 *
 * Used to show the right thing, never to decide it — the same check runs in
 * the API handlers that write, which is where the limit actually is.
 *
 * It starts optimistic. A page that flashes "your trial has ended" while it
 * waits for an answer would be a horrible thing to do to somebody.
 */
const OPTIMISTIC: Entitlement = {
  canWrite: true,
  state: "trial",
  trialDaysLeft: null,
  trialEnds: null,
  paidUntil: null,
};

export function useEntitlement() {
  const [entitlement, setEntitlement] = useState<Entitlement>(OPTIMISTIC);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEntitlement = useCallback(async () => {
    try {
      const response = await fetch("/api/users/entitlement");
      if (!response.ok) return;
      setEntitlement(await response.json());
    } catch {
      // Leave it optimistic: the server is the one that decides.
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntitlement();
  }, [fetchEntitlement]);

  return { entitlement, isLoading, refresh: fetchEntitlement };
}
