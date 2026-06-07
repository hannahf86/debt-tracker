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

  if (req.method === "DELETE") {
    try {
      // Delete all user data in order
      await supabase
        .from("missed_payments")
        .delete()
        .eq("user_id", session.user.id);

      const { data: debts } = await supabase
        .from("debts")
        .select("id")
        .eq("user_id", session.user.id);

      if (debts && debts.length > 0) {
        const debtIds = debts.map((d) => d.id);
        await supabase.from("payments").delete().in("debt_id", debtIds);
      }

      await supabase.from("debts").delete().eq("user_id", session.user.id);
      await supabase.from("users").delete().eq("id", session.user.id);

      // Delete from Supabase auth
      const { error } = await supabase.auth.admin.deleteUser(session.user.id);
      if (error) throw error;

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error deleting account:", error);
      return res.status(500).json({ error: "Failed to delete account" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
