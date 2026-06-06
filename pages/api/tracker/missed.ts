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

  if (req.method === "POST") {
    const { debt_id, month, year, due_date, reason, actions } = req.body;

    if (!debt_id || !month || !year || !reason) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const { data, error } = await supabase
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
