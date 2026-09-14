import { useEffect, useState } from "react";
import type { Creditor } from "@/lib/types";

/** The directory entry a debt is linked to, if any. Quietly null on failure. */
export function useCreditor(id: number | null | undefined) {
  const [creditor, setCreditor] = useState<Creditor | null>(null);

  useEffect(() => {
    if (!id) {
      setCreditor(null);
      return;
    }
    let cancelled = false;
    fetch(`/api/creditors?id=${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) setCreditor(data);
      })
      .catch(() => {
        if (!cancelled) setCreditor(null);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { creditor };
}
