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

    const monthNum = parseInt(month as string);
    const yearNum = parseInt(year as string);

    // Build date range for the month
    const startDate = `${yearNum}-${String(monthNum).padStart(2, "0")}-01`;
    const endMonth = monthNum === 12 ? 1 : monthNum + 1;
    const endYear = monthNum === 12 ? yearNum + 1 : yearNum;
    const endDate = `${endYear}-${String(endMonth).padStart(2, "0")}-01`;

    try {
      const { data: payments, error: paymentsError } = await supabase
        .from("payments")
        .select("*")
        .eq("debt_id", debtId)
        .gte("payment_date", startDate)
        .lt("payment_date", endDate)
        .order("payment_date", { ascending: false });

      if (paymentsError) throw paymentsError;

      const { data: notes, error: notesError } = await supabase
        .from("missed_payments")
        .select("*")
        .eq("debt_id", debtId)
        .eq("month", monthNum)
        .eq("year", yearNum);

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
