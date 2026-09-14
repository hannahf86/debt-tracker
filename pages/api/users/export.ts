import { getSession } from "@/lib/devAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Download your data — the UK GDPR right of access and right to data
 * portability. Returns everything Mirian holds about the signed-in person as
 * one JSON file.
 *
 * Every query is scoped to their own id. IF YOU ADD A TABLE THAT STORES
 * PERSONAL DATA, ADD IT HERE, and to the deletion in users/delete.ts.
 */

type Result<T> = { data: T | null; error: { code?: string; message: string } | null };

// A table that hasn't been created yet shouldn't break the whole export.
function rows<T>(result: Result<T[]>): T[] {
  if (result.error) {
    if (result.error.code === "42P01") return [];
    throw result.error;
  }
  return result.data ?? [];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getSession(req, res);

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const userId = session.user.id;

  try {
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.getUserById(userId);
    if (authError) throw authError;
    const authUser = authData.user;

    const profile = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (profile.error) throw profile.error;

    const debts = rows(
      await supabaseAdmin
        .from("debts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true }),
    );
    const debtIds = debts.map((d: { id: string }) => d.id);

    const payments = debtIds.length
      ? rows(
          await supabaseAdmin
            .from("payments")
            .select("*")
            .in("debt_id", debtIds)
            .order("payment_date", { ascending: true }),
        )
      : [];

    const missedPaymentNotes = rows(
      await supabaseAdmin
        .from("missed_payments")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true }),
    );

    const contactHistory = rows(
      await supabaseAdmin
        .from("contact_log")
        .select("*")
        .eq("user_id", userId)
        .order("sent_at", { ascending: true }),
    );

    const exportedAt = new Date().toISOString();

    const file = {
      about:
        "Everything Mirian holds about you. Your password isn't included: it's stored scrambled, and nobody at Mirian can read it.",
      exported_at: exportedAt,
      account: {
        email: authUser?.email ?? null,
        email_confirmed_at: authUser?.email_confirmed_at ?? null,
        created_at: authUser?.created_at ?? null,
        last_sign_in_at: authUser?.last_sign_in_at ?? null,
        details: authUser?.user_metadata ?? {},
      },
      profile: profile.data ?? null,
      debts,
      payments,
      missed_payment_notes: missedPaymentNotes,
      contact_history: contactHistory,
    };

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="mirian-data-${exportedAt.slice(0, 10)}.json"`,
    );
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(JSON.stringify(file, null, 2));
  } catch (error) {
    // Log the failure, never the data.
    console.error(
      "Error exporting data:",
      error instanceof Error ? error.message : "unknown error",
    );
    return res.status(500).json({ error: "We couldn't prepare your data just now." });
  }
}
