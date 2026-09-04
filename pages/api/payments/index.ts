import { getSession } from "@/lib/devAuth";
import { db } from "@/lib/supabaseAdmin";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getSession(req, res);

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    const { debtId } = req.query;

    if (!debtId || typeof debtId !== "string") {
      return res.status(400).json({ error: "Debt ID required" });
    }

    try {
      const { data: debt } = await db
        .from("debts")
        .select("id")
        .eq("id", debtId)
        .eq("user_id", session.user.id)
        .single();

      if (!debt) return res.status(403).json({ error: "Forbidden" });

      const { data: payments, error } = await db
        .from("payments")
        .select("*")
        .eq("debt_id", debtId)
        .order("payment_date", { ascending: false });

      if (error) throw error;

      return res.status(200).json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      return res.status(500).json({ error: "Failed to fetch payments" });
    }
  }

  if (req.method === "POST") {
    const {
      debt_id,
      amount,
      payment_date,
      payment_type,
      expected_amount,
      late_reason,
      short_reason,
    } = req.body;

    if (!debt_id || !amount || !payment_date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const { data: debt } = await db
        .from("debts")
        .select("id, amount_owed, monthly_amount, created_at")
        .eq("id", debt_id)
        .eq("user_id", session.user.id)
        .single();

      if (!debt) return res.status(403).json({ error: "Forbidden" });

      // Create payment
      const { data: payment, error: paymentError } = await db
        .from("payments")
        .insert([
          {
            debt_id,
            amount: parseFloat(amount),
            payment_date,
            payment_type: payment_type || "on-time",
            expected_amount: expected_amount
              ? parseFloat(expected_amount)
              : null,
          },
        ])
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Backfill: a payment dated before the debt was added is already
      // reflected in the balance the user typed in, so recording it must not
      // deduct again. It still shows in the tracker, which is the point —
      // seeing the year fill in is the reward.
      const addedOn = new Date(debt.created_at);
      const paidOn = new Date(payment_date);
      const isBackfill =
        new Date(paidOn.getFullYear(), paidOn.getMonth(), paidOn.getDate()) <
        new Date(addedOn.getFullYear(), addedOn.getMonth(), addedOn.getDate());

      const newAmount = isBackfill
        ? debt.amount_owed
        : Math.max(0, debt.amount_owed - parseFloat(amount));

      if (!isBackfill) {
        const { error: updateError } = await db
          .from("debts")
          .update({ amount_owed: newAmount })
          .eq("id", debt_id);

        if (updateError) throw updateError;
      }

      // If late or short, log a missed payment note
      if (
        (late_reason || short_reason) &&
        (payment_type === "late" ||
          payment_type === "partial" ||
          payment_type === "partial-late")
      ) {
        const paymentDateObj = new Date(payment_date);
        await db.from("missed_payments").insert([
          {
            user_id: session.user.id,
            debt_id,
            month: paymentDateObj.getMonth() + 1,
            year: paymentDateObj.getFullYear(),
            reason: late_reason || short_reason,
            due_date: payment_date,
          },
        ]);
      }

      return res.status(201).json({ ...payment, affected_balance: !isBackfill, new_amount_owed: newAmount });
    } catch (error) {
      console.error("Error creating payment:", error);
      return res.status(500).json({ error: "Failed to create payment" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
