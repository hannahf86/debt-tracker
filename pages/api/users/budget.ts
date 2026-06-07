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

  if (req.method === "PUT") {
    const { monthly_budget } = req.body;

    try {
      const { error } = await supabase
        .from("users")
        .update({ monthly_budget })
        .eq("id", session.user.id);

      if (error) throw error;

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error updating budget:", error);
      return res.status(500).json({ error: "Failed to update budget" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
