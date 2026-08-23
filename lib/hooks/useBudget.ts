import { useState, useEffect, useCallback } from "react";

export function useBudget() {
  const [budget, setBudget] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBudget = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/users/budget");
      if (!response.ok) throw new Error("Failed to fetch budget");
      const data = await response.json();
      setBudget(
        typeof data.monthly_budget === "number" ? data.monthly_budget : null,
      );
    } catch {
      setBudget(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBudget();
  }, [fetchBudget]);

  return { budget, isLoading, fetchBudget };
}
