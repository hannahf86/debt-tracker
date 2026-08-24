import { getSession } from "@/lib/devAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { describeDbError } from "@/lib/dbError";
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Name, display name and monthly budget.
 *
 * Names live in Supabase auth `user_metadata` rather than a column, so adding
 * them needs no migration. The budget stays on `public.users`.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getSession(req, res);

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = session.user.id;

  if (req.method === "GET") {
    try {
      const [{ data: authUser }, { data: row }] = await Promise.all([
        supabaseAdmin.auth.admin.getUserById(userId),
        supabaseAdmin
          .from("users")
          .select("monthly_budget")
          .eq("id", userId)
          .maybeSingle(),
      ]);

      const meta = authUser?.user?.user_metadata ?? {};
      return res.status(200).json({
        name: meta.name ?? null,
        display_name: meta.display_name ?? null,
        email: session.user.email ?? null,
        monthly_budget: row?.monthly_budget ?? null,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      return res.status(500).json({ error: "Failed to fetch profile" });
    }
  }

  if (req.method === "PUT") {
    const { name, display_name, monthly_budget } = req.body;

    try {
      // Only touch the metadata keys actually supplied.
      const meta: Record<string, string> = {};
      if (typeof name === "string") meta.name = name.trim();
      if (typeof display_name === "string")
        meta.display_name = display_name.trim();

      if (Object.keys(meta).length > 0) {
        const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
          user_metadata: meta,
        });
        if (error) throw error;
      }

      if (monthly_budget !== undefined) {
        const { error } = await supabaseAdmin.from("users").upsert(
          {
            id: userId,
            email: session.user.email,
            monthly_budget:
              monthly_budget === null || monthly_budget === ""
                ? null
                : Number(monthly_budget),
          },
          { onConflict: "id" },
        );
        if (error) throw error;
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error updating profile:", error);
      return res
        .status(500)
        .json({ error: describeDbError(error, "Failed to save your details") });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
