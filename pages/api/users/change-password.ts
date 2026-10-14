import { getSession } from "@/lib/devAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { NextApiRequest, NextApiResponse } from "next";
import { describePasswordError } from "@/lib/dbError";
import { checkPassword } from "@/lib/password";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getSession(req, res);

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "POST") {
    const { password } = req.body;

    if (typeof password !== "string") {
      return res.status(400).json({ error: "Password required" });
    }
    const tooWeak = checkPassword(password);
    if (tooWeak) return res.status(400).json({ error: tooWeak });

    try {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(
        session.user.id,
        { password },
      );

      if (error) throw error;

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error changing password:", error);
      const kinder = describePasswordError((error as { message?: string })?.message);
      if (kinder) return res.status(400).json({ error: kinder });
      return res.status(500).json({ error: "Failed to change password" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
