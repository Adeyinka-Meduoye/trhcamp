import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  return res.status(200).json({
    success: true,
    message: "TRH Camp API is running successfully.",
    timestamp: new Date().toISOString(),
  });
}