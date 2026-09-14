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

  if (req.method === "DELETE") {
    try {
      // Delete all user data in order.
      //
      // .delete() resolves with an { error } rather than throwing, so every
      // step needs checking. Unchecked, a half-finished deletion still returned
      // { success: true } — and this is the endpoint that tells someone their
      // data is gone.
      const { error: notesError } = await supabaseAdmin
        .from("missed_payments")
        .delete()
        .eq("user_id", session.user.id);
      if (notesError) throw notesError;

      // Contact history would go with the debts via its foreign key anyway,
      // but deletion is the one place that must not rely on a schema detail
      // someone could change. IF YOU ADD A TABLE THAT STORES PERSONAL DATA,
      // DELETE IT HERE, and add it to users/export.ts.
      const { error: contactsError } = await supabaseAdmin
        .from("contact_log")
        .delete()
        .eq("user_id", session.user.id);
      // 42P01: the table hasn't been created, so there's nothing to delete.
      if (contactsError && contactsError.code !== "42P01") throw contactsError;

      const { data: debts, error: debtsReadError } = await supabaseAdmin
        .from("debts")
        .select("id")
        .eq("user_id", session.user.id);
      if (debtsReadError) throw debtsReadError;

      if (debts && debts.length > 0) {
        const debtIds = debts.map((d) => d.id);
        const { error: paymentsError } = await supabaseAdmin
          .from("payments")
          .delete()
          .in("debt_id", debtIds);
        if (paymentsError) throw paymentsError;
      }

      const { error: debtsError } = await supabaseAdmin
        .from("debts")
        .delete()
        .eq("user_id", session.user.id);
      if (debtsError) throw debtsError;

      const { error: userError } = await supabaseAdmin
        .from("users")
        .delete()
        .eq("id", session.user.id);
      if (userError) throw userError;

      // Delete from Supabase auth
      const { error } = await supabaseAdmin.auth.admin.deleteUser(session.user.id);
      if (error) throw error;

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error deleting account:", error);
      return res.status(500).json({ error: "Failed to delete account" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
