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
      const { data, error } = await supabaseAdmin
        .from("users")
        .select("monthly_budget")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error) throw error;

      return res.status(200).json({ monthly_budget: data?.monthly_budget ?? null });
    } catch (error) {
      console.error("Error fetching budget:", error);
      return res.status(500).json({ error: "Failed to fetch budget" });
    }
  }

  if (req.method === "PUT") {
    const { monthly_budget } = req.body;

    try {
      // Upsert rather than update: signing up creates the auth.users row but
      // nothing creates the matching public.users row, so a plain update on a
      // brand-new account would silently affect zero rows.
      const { error } = await supabaseAdmin.from("users").upsert(
        {
          id: session.user.id,
          email: session.user.email,
          monthly_budget,
        },
        { onConflict: "id" },
      );

      if (error) throw error;

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error updating budget:", error);
      return res.status(500).json({ error: "Failed to update budget" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
