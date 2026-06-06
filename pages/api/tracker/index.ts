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
    try {
      const { data: debts, error: debtsError } = await supabase
        .from("debts")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: true });

      if (debtsError) throw debtsError;

      if (!debts || debts.length === 0) {
        return res.status(200).json({ debts: [], payments: [] });
      }

      const year = new Date().getFullYear();
      const debtIds = debts.map((d) => d.id);

      const { data: payments, error: paymentsError } = await supabase
        .from("payments")
        .select("*")
        .in("debt_id", debtIds)
        .gte("payment_date", `${year}-01-01`)
        .lte("payment_date", `${year}-12-31`);

      if (paymentsError) throw paymentsError;

      return res.status(200).json({ debts, payments: payments || [] });
    } catch (error) {
      console.error("Error fetching tracker data:", error);
      return res.status(500).json({ error: "Failed to fetch tracker data" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
