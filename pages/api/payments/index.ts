import { getSession } from "@/lib/devAuth";
import { interestOver, isCharging, splitPayment, daysBetween } from "@/lib/interest";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
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
      const { data: debt } = await supabaseAdmin
        .from("debts")
        .select("id")
        .eq("id", debtId)
        .eq("user_id", session.user.id)
        .single();

      if (!debt) return res.status(403).json({ error: "Forbidden" });

      const { data: payments, error } = await supabaseAdmin
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
      const { data: debt } = await supabaseAdmin
        .from("debts")
        .select(
          "id, amount_owed, monthly_amount, created_at, interest_state, interest_rate",
        )
        .eq("id", debt_id)
        .eq("user_id", session.user.id)
        .single();

      if (!debt) return res.status(403).json({ error: "Forbidden" });

      // Backfill: a payment dated before the debt was added is already
      // reflected in the balance the user typed in, so recording it must not
      // deduct again. It still shows in the tracker, which is the point —
      // seeing the year fill in is the reward.
      const addedOn = new Date(debt.created_at);
      const paidOn = new Date(payment_date);
      const isBackfill =
        new Date(paidOn.getFullYear(), paidOn.getMonth(), paidOn.getDate()) <
        new Date(addedOn.getFullYear(), addedOn.getMonth(), addedOn.getDate());

      const paid = parseFloat(amount);

      /* Interest since the last payment, or since the debt was added if this
         is the first. Read before the new row is inserted, or it would find
         itself. Backfilled payments get none of this: we don't know what the
         balance was back then, and an invented figure is worse than a gap. */
      let interest = 0;
      if (!isBackfill && isCharging(debt)) {
        const { data: previous } = await supabaseAdmin
          .from("payments")
          .select("payment_date")
          .eq("debt_id", debt_id)
          .order("payment_date", { ascending: false })
          .limit(1);

        const since = previous?.[0]?.payment_date ?? debt.created_at;
        interest = interestOver(
          debt.amount_owed,
          debt.interest_rate as number,
          daysBetween(since, payment_date),
        );
      }

      const split = splitPayment(debt.amount_owed, paid, interest);
      const newAmount = isBackfill ? debt.amount_owed : split.balanceAfter;

      // Create payment
      const { data: payment, error: paymentError } = await supabaseAdmin
        .from("payments")
        .insert([
          {
            debt_id,
            amount: paid,
            payment_date,
            payment_type: payment_type || "on-time",
            expected_amount: expected_amount
              ? parseFloat(expected_amount)
              : null,
            interest_applied: isBackfill ? null : split.interest,
            principal_applied: isBackfill ? null : split.principal,
            balance_after: isBackfill ? null : split.balanceAfter,
          },
        ])
        .select()
        .single();

      if (paymentError) throw paymentError;

      if (!isBackfill) {
        const { error: updateError } = await supabaseAdmin
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
        await supabaseAdmin.from("missed_payments").insert([
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

      return res.status(201).json({
        ...payment,
        affected_balance: !isBackfill,
        new_amount_owed: newAmount,
        interest_applied: isBackfill ? null : split.interest,
        principal_applied: isBackfill ? null : split.principal,
        balance_grew: isBackfill ? false : split.balanceGrew,
      });
    } catch (error) {
      console.error("Error creating payment:", error);
      return res.status(500).json({ error: "Failed to create payment" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
