import { getSession } from "@/lib/devAuth";
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

  if (req.method === "POST") {
    const { debt_id, month, year, due_date, reason, actions } = req.body;

    if (!debt_id || !month || !year || !reason) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      // Verify ownership. user_id below is taken from the session, but debt_id
      // comes from the body — without this check a note could be attached to
      // someone else's debt, and it would surface in their tracker as if they
      // had written it.
      const { data: debt } = await supabaseAdmin
        .from("debts")
        .select("id")
        .eq("id", debt_id)
        .eq("user_id", session.user.id)
        .single();

      if (!debt) return res.status(403).json({ error: "Forbidden" });

      const { data, error } = await supabaseAdmin
        .from("missed_payments")
        .insert([
          {
            user_id: session.user.id,
            debt_id,
            month,
            year,
            due_date: due_date || null,
            reason,
            actions: actions || null,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json(data);
    } catch (error) {
      console.error("Error logging missed payment:", error);
      return res.status(500).json({ error: "Failed to log missed payment" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
