import type { NextApiRequest, NextApiResponse } from "next";
import { Deso } from "deso.js";

const deso = new Deso({});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const pkey = req.query.pkey as string;
  if (!pkey) throw new Error("pkey required");

  const profile = await deso.getSingleProfile({
    publicKey: pkey,
  });

  res.status(200).json(profile);
}
