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

  if (req.method === "GET") {
    try {
      const { data: debts, error: debtsError } = await supabaseAdmin
        .from("debts")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: true });

      if (debtsError) throw debtsError;

      if (!debts || debts.length === 0) {
        return res.status(200).json({ debts: [], payments: [], totalPaid: 0 });
      }

      const year = new Date().getFullYear();
      const debtIds = debts.map((d) => d.id);

      const { data: payments, error: paymentsError } = await supabaseAdmin
        .from("payments")
        .select("*")
        .in("debt_id", debtIds)
        .gte("payment_date", `${year}-01-01`)
        .lte("payment_date", `${year}-12-31`);

      if (paymentsError) throw paymentsError;

      // Everything ever paid, across every year — the grid above is scoped to
      // the year on screen, but "debt cleared so far" counts the lot,
      // backfilled history included. It deliberately doesn't match
      // total_amount - amount_owed: a payment made before the debt was added
      // is already reflected in the balance entered at signup, so it never
      // moves that figure, but the user still paid it.
      const { data: allPayments, error: allPaymentsError } = await supabaseAdmin
        .from("payments")
        .select("amount")
        .in("debt_id", debtIds);

      if (allPaymentsError) throw allPaymentsError;

      const totalPaid = (allPayments ?? []).reduce(
        (sum, p) => sum + (Number(p.amount) || 0),
        0,
      );

      return res
        .status(200)
        .json({ debts, payments: payments || [], totalPaid });
    } catch (error) {
      console.error("Error fetching tracker data:", error);
      return res.status(500).json({ error: "Failed to fetch tracker data" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
