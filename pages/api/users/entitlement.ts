import { getSession } from "@/lib/devAuth";
import { getEntitlement } from "@/lib/entitlement";
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Where this account stands: in trial, paid, a tester, or read-only.
 *
 * The page uses this to show the right thing and to avoid offering a form
 * that would be refused. It is not the limit — the limit is the same check
 * inside the handlers that write.
 */
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

  try {
    return res.status(200).json(await getEntitlement(session.user.id));
  } catch (error) {
    console.error("Error reading entitlement:", error);
    /* If this breaks, let people carry on. A billing check that fails closed
       would lock everybody out of their own tracker over a bad query. */
    return res.status(200).json({
      canWrite: true,
      state: "trial",
      trialDaysLeft: null,
      trialEnds: null,
      paidUntil: null,
    });
  }
}
