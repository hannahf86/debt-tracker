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

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Debt ID required" });
  }

  // Verify ownership
  const { data: debt } = await supabase
    .from("debts")
    .select("user_id")
    .eq("id", id)
    .single();

  if (!debt || debt.user_id !== session.user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  if (req.method === "GET") {
    try {
      const { data, error } = await supabase
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

  if (req.method === "PUT") {
    const { amount_owed, status, ...updateData } = req.body;

    try {
      const { data: updated, error } = await supabase
        .from("debts")
        .update({
          ...updateData,
          ...(amount_owed !== undefined && {
            amount_owed: parseFloat(amount_owed),
          }),
          ...(status && { status }),
        })
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
      await supabase.from("debts").delete().eq("id", id);

      return res.status(204).end();
    } catch (error) {
      console.error("Error deleting debt:", error);
      return res.status(500).json({ error: "Failed to delete debt" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
