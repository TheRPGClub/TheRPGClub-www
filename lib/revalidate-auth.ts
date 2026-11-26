import { createHash, timingSafeEqual } from "node:crypto";

// The API's call to /api/revalidate (spec api#518) carries
// `Authorization: Bearer $REVALIDATE_SECRET`. Compared in constant time:
// both sides are hashed first, so neither the secret's length nor its
// leading characters leak through the timing.

export type RevalidateAuth = "ok" | "unauthorized" | "unconfigured";

function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

export function checkRevalidateAuth(
  authorization: string | null,
  secret: string | undefined,
): RevalidateAuth {
  if (!secret) return "unconfigured";
  const match = /^Bearer (.+)$/.exec(authorization ?? "");
  if (!match) return "unauthorized";
  return timingSafeEqual(digest(match[1]), digest(secret)) ? "ok" : "unauthorized";
}
