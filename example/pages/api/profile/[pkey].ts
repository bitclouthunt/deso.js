import type { NextApiRequest, NextApiResponse } from "next";
import { BitClout } from "bitclout-sdk";

const bitclout = new BitClout({});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const pkey = req.query.pkey as string;
  if (!pkey) throw new Error("pkey required");

  const profile = await bitclout.getSingleProfile({
    publicKey: pkey,
  });

  res.status(200).json(profile);
}
