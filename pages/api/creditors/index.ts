import { getSession } from "@/lib/devAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isCreditorCategory } from "@/lib/creditors";
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * The company directory.
 *
 *   GET ?id=12                    one company
 *   GET ?category=energy&q=octo   search within a category
 *
 * A search with no text returns nothing, so the picker can't dump the whole
 * list on someone — except council tax, which is a single GOV.UK entry.
 * Reference data rather than user data, but still behind sign-in and read
 * through the service role like every other table.
 */

const COLUMNS = "id, name, category, support_url, email";
const MAX_RESULTS = 8;

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

  const { id, category, q } = req.query;

  try {
    if (typeof id === "string" && id) {
      const creditorId = Number(id);
      if (!Number.isInteger(creditorId)) {
        return res.status(400).json({ error: "Invalid company" });
      }

      const { data, error } = await supabaseAdmin
        .from("creditors")
        .select(COLUMNS)
        .eq("id", creditorId)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      if (!data) return res.status(404).json({ error: "Company not found" });

      return res.status(200).json(data);
    }

    if (typeof category !== "string" || !isCreditorCategory(category)) {
      return res.status(400).json({ error: "Pick a kind of company first" });
    }

    // Match the same way search_key is built: lower case, no punctuation, so
    // "eon", "E.ON" and "e on" all find E.ON Next.
    const term =
      typeof q === "string"
        ? q.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim().slice(0, 60)
        : "";

    if (!term && category !== "council_tax") {
      return res.status(200).json([]);
    }

    let search = supabaseAdmin
      .from("creditors")
      .select(COLUMNS)
      .eq("category", category)
      .eq("is_active", true);

    if (term) search = search.ilike("search_key", `%${term}%`);

    const { data, error } = await search.order("name").limit(MAX_RESULTS);

    if (error) throw error;

    return res.status(200).json(data ?? []);
  } catch (error) {
    console.error("Error searching companies:", error);
    return res.status(500).json({ error: "Failed to search companies" });
  }
}
