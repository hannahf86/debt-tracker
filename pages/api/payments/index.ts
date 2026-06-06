import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { supabase } from "@/lib/supabase";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    const { debtId } = req.query;

    if (!debtId || typeof debtId !== "string") {
      return res.status(400).json({ error: "Debt ID required" });
    }

    try {
      const { data: debt } = await supabase
        .from("debts")
        .select("id")
        .eq("id", debtId)
        .eq("user_id", session.user.id)
        .single();

      if (!debt) return res.status(403).json({ error: "Forbidden" });

      const { data: payments, error } = await supabase
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
      const { data: debt } = await supabase
        .from("debts")
        .select("id, amount_owed, monthly_amount")
        .eq("id", debt_id)
        .eq("user_id", session.user.id)
        .single();

      if (!debt) return res.status(403).json({ error: "Forbidden" });

      // Create payment
      const { data: payment, error: paymentError } = await supabase
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

      // Update amount owed
      const newAmount = Math.max(0, debt.amount_owed - parseFloat(amount));
      const { error: updateError } = await supabase
        .from("debts")
        .update({ amount_owed: newAmount })
        .eq("id", debt_id);

      if (updateError) throw updateError;

      // If late or short, log a missed payment note
      if (
        (late_reason || short_reason) &&
        (payment_type === "late" ||
          payment_type === "partial" ||
          payment_type === "partial-late")
      ) {
        const paymentDateObj = new Date(payment_date);
        await supabase.from("missed_payments").insert([
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

      return res.status(201).json(payment);
    } catch (error) {
      console.error("Error creating payment:", error);
      return res.status(500).json({ error: "Failed to create payment" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
