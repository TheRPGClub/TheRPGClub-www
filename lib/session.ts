import { cache } from "react";
import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { AppSession } from "@/lib/auth-types";

export type { SessionPrincipal, SessionMembership, AppSession } from "@/lib/auth-types";
export { discordAvatarUrl } from "@/lib/auth-types";

export const getSession = cache(async (): Promise<AppSession | null> => {
  try {
    const res = await apiFetch("/api/v1/session", { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
});

export async function requireAuth(): Promise<AppSession> {
  const session = await getSession();
  if (!session) redirect("/");
  return session;
}
