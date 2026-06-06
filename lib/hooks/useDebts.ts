import { useState, useEffect, useCallback } from "react";
import type { Debt } from "@/lib/types";

export function useDebts() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDebts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/debts");

      if (!response.ok) {
        throw new Error("Failed to fetch debts");
      }

      const data = await response.json();
      setDebts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setDebts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createDebt = useCallback(
    async (
      debtData: Omit<Debt, "id" | "user_id" | "created_at" | "updated_at">,
    ) => {
      try {
        const response = await fetch("/api/debts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(debtData),
        });

        if (!response.ok) {
          throw new Error("Failed to create debt");
        }

        const newDebt = await response.json();
        setDebts([newDebt, ...debts]);
        return newDebt;
      } catch (err) {
        throw err instanceof Error ? err : new Error("An error occurred");
      }
    },
    [debts],
  );

  const updateDebt = useCallback(
    async (id: string, updates: Partial<Debt>) => {
      try {
        const response = await fetch(`/api/debts/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error("Failed to update debt");
        }

        const updated = await response.json();
        setDebts(debts.map((d) => (d.id === id ? updated : d)));
        return updated;
      } catch (err) {
        throw err instanceof Error ? err : new Error("An error occurred");
      }
    },
    [debts],
  );

  const deleteDebt = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/debts/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete debt");
        }

        setDebts(debts.filter((d) => d.id !== id));
      } catch (err) {
        throw err instanceof Error ? err : new Error("An error occurred");
      }
    },
    [debts],
  );

  useEffect(() => {
    fetchDebts();
  }, [fetchDebts]);

  return {
    debts,
    isLoading,
    error,
    fetchDebts,
    createDebt,
    updateDebt,
    deleteDebt,
  };
}
