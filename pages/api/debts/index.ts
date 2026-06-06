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

  if (req.method === "GET") {
    try {
      const { data: debts, error } = await supabase
        .from("debts")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return res.status(200).json(debts);
    } catch (error) {
      console.error("Error fetching debts:", error);
      return res.status(500).json({ error: "Failed to fetch debts" });
    }
  }

  if (req.method === "POST") {
    const {
      company,
      amount_owed,
      total_amount,
      monthly_amount,
      category,
      arrangement,
      direct_debit_date,
      account_reference,
      company_email,
    } = req.body;

    console.log("Request body:", req.body);

    if (!company || !total_amount || !category) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const { data: debt, error } = await supabase
        .from("debts")
        .insert([
          {
            user_id: session.user.id,
            name: company,
            company,
            amount_owed: parseFloat(total_amount), // starts at full amount
            total_amount: parseFloat(total_amount),
            monthly_amount: monthly_amount ? parseFloat(monthly_amount) : null,
            category,
            arrangement: arrangement || null,
            direct_debit_date: direct_debit_date
              ? parseInt(direct_debit_date)
              : null,
            account_reference: account_reference || null,
            company_email: company_email || null,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json(debt);
    } catch (error) {
      console.error("Error creating debt:", error);
      return res.status(500).json({ error: "Failed to create debt" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
