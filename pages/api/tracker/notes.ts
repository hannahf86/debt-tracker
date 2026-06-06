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
    const { debtId, month, year } = req.query;

    if (!debtId || !month || !year) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      // Get payments for this debt/month
      const monthStr = `${year}-${String(parseInt(month as string)).padStart(2, "0")}`;

      const { data: payments, error: paymentsError } = await supabase
        .from("payments")
        .select("*")
        .eq("debt_id", debtId)
        .like("payment_date", `${monthStr}%`)
        .order("payment_date", { ascending: false });

      if (paymentsError) throw paymentsError;

      // Get missed payment notes
      const { data: notes, error: notesError } = await supabase
        .from("missed_payments")
        .select("*")
        .eq("debt_id", debtId)
        .eq("month", parseInt(month as string))
        .eq("year", parseInt(year as string));

      if (notesError) throw notesError;

      return res
        .status(200)
        .json({ payments: payments || [], notes: notes || [] });
    } catch (error) {
      console.error("Error fetching notes:", error);
      return res.status(500).json({ error: "Failed to fetch notes" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
