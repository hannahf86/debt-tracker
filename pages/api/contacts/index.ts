import { getSession } from "@/lib/devAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { TEMPLATES } from "@/lib/templates";
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Contact history for a debt: GET lists it, POST records a message the person
 * has told us they sent.
 *
 * Every query carries user_id as well as the debt ownership check, so this
 * route stays safe even if the check above it is ever moved.
 */

const METHODS = ["email", "copy", "letter"];
const MAX_BODY = 10_000;
const MAX_SUBJECT = 300;

async function ownsDebt(debtId: string, userId: string) {
  const { data } = await supabaseAdmin
    .from("debts")
    .select("id")
    .eq("id", debtId)
    .eq("user_id", userId)
    .single();
  return Boolean(data);
}

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
    const { debtId } = req.query;

    if (!debtId || typeof debtId !== "string") {
      return res.status(400).json({ error: "Debt ID required" });
    }

    try {
      if (!(await ownsDebt(debtId, userId))) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const { data, error } = await supabaseAdmin
        .from("contact_log")
        .select("id, debt_id, template, method, subject, body, sent_at")
        .eq("debt_id", debtId)
        .eq("user_id", userId)
        .order("sent_at", { ascending: false });

      if (error) throw error;

      return res.status(200).json(data ?? []);
    } catch (error) {
      console.error("Error fetching contact history:", error);
      return res.status(500).json({ error: "Failed to fetch contact history" });
    }
  }

  if (req.method === "POST") {
    const { debt_id, template, method, subject, body } = req.body ?? {};
    const debtId = debt_id == null ? "" : String(debt_id);

    if (
      !debtId ||
      !TEMPLATES.some((t) => t.id === template) ||
      !METHODS.includes(method) ||
      typeof body !== "string" ||
      !body.trim() ||
      body.length > MAX_BODY ||
      (subject != null &&
        (typeof subject !== "string" || subject.length > MAX_SUBJECT))
    ) {
      return res.status(400).json({ error: "That message couldn't be saved." });
    }

    try {
      if (!(await ownsDebt(debtId, userId))) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const { data, error } = await supabaseAdmin
        .from("contact_log")
        .insert([
          {
            user_id: userId,
            debt_id: debtId,
            template,
            method,
            subject: subject?.trim() || null,
            body,
          },
        ])
        .select("id, debt_id, template, method, subject, body, sent_at")
        .single();

      if (error) throw error;

      return res.status(201).json(data);
    } catch (error) {
      console.error("Error saving contact:", error);
      return res
        .status(500)
        .json({ error: "We couldn't save that just now. Please try again." });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
