import NextAuth from "next-auth";
import type { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "@/lib/authOptions";
import { DEV_NO_AUTH } from "@/lib/devFlags";
import { getDevSession } from "@/lib/devAuth";

export { authOptions };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Dev-only: answer the session endpoint with a synthetic session so the whole
  // app (SessionProvider, useSession, every page guard) behaves as if logged in.
  const route = (req.query.nextauth as string[] | undefined)?.[0];
  if (DEV_NO_AUTH && route === "session") {
    return res.status(200).json((await getDevSession()) ?? {});
  }

  return NextAuth(req, res, authOptions);
}
