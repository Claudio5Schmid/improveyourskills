import "server-only";

import { headers } from "next/headers";

/** Vercel sets `x-forwarded-for`; first entry is the actual visitor. */
export async function clientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return h.get("x-real-ip") ?? "unknown";
}

export { hashIp } from "./hash-ip";
