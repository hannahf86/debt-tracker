import { useState, useCallback } from "react";
import type { Payment } from "@/lib/types";

export function usePayments(debtId: string | null) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPayments = useCallback(async () => {
    if (!debtId) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/payments?debtId=${debtId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch payments");
      }

      const data = await response.json();
      setPayments(data);
    } catch (error) {
      console.error("Error fetching payments:", error);
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  }, [debtId]);

  const createPayment = useCallback(
    async (amount: number, payment_date: string) => {
      if (!debtId) throw new Error("Debt ID required");

      try {
        const response = await fetch("/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            debt_id: debtId,
            amount,
            payment_date,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create payment");
        }

        const newPayment = await response.json();
        setPayments([newPayment, ...payments]);
        return newPayment;
      } catch (error) {
        throw error instanceof Error ? error : new Error("An error occurred");
      }
    },
    [debtId, payments],
  );

  return {
    payments,
    isLoading,
    fetchPayments,
    createPayment,
  };
}
