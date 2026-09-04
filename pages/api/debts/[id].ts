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

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Debt ID required" });
  }

  // Verify ownership
  const { data: debt } = await db
    .from("debts")
    .select("user_id")
    .eq("id", id)
    .single();

  if (!debt || debt.user_id !== session.user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  if (req.method === "GET") {
    try {
      const { data, error } = await db
        .from("debts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      return res.status(200).json(data);
    } catch (error) {
      console.error("Error fetching debt:", error);
      return res.status(500).json({ error: "Failed to fetch debt" });
    }
  }

  // Only these columns may be set from the request. Spreading the body
  // straight into the update let a caller write any column — including
  // user_id, which would hand their debt row to somebody else's account.
  const EDITABLE = [
    "company",
    "name",
    "category",
    "total_amount",
    "amount_owed",
    "monthly_amount",
    "arrangement",
    "direct_debit_date",
    "account_reference",
    "company_email",
    "status",
  ] as const;

  const NUMERIC = ["total_amount", "amount_owed", "monthly_amount"];

  if (req.method === "PUT") {
    const updateData: Record<string, unknown> = {};
    for (const key of EDITABLE) {
      const value = req.body?.[key];
      if (value === undefined) continue;
      updateData[key] =
        NUMERIC.includes(key) && value !== null ? parseFloat(value) : value;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "Nothing to update" });
    }

    try {
      const { data: updated, error } = await db
        .from("debts")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json(updated);
    } catch (error) {
      console.error("Error updating debt:", error);
      return res.status(500).json({ error: "Failed to update debt" });
    }
  }

  if (req.method === "DELETE") {
    try {
      await db.from("debts").delete().eq("id", id);

      return res.status(204).end();
    } catch (error) {
      console.error("Error deleting debt:", error);
      return res.status(500).json({ error: "Failed to delete debt" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
