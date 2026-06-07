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
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    try {
      const { error } = await supabase.auth.admin.updateUserById(
        session.user.id,
        { password },
      );

      if (error) throw error;

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error changing password:", error);
      return res.status(500).json({ error: "Failed to change password" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
