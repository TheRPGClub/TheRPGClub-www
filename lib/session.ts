import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { AppSession } from "@/lib/auth-types";
import { featureView, type FeatureKey, type FeatureView } from "@/lib/features";

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

// The viewer's Features from the session (lib/features.ts). Shares the
// request's one session read with the layout and the page.
export async function getFeatures(): Promise<FeatureView> {
  return featureView((await getSession())?.features);
}

// For a Feature's own pages: not-found when the Feature's flag hides it from
// this viewer. A Feature the member hid by preference still renders, so a
// shared link keeps working. Returns the view for the page's Preview badge.
export async function requireFeature(key: FeatureKey): Promise<FeatureView> {
  const features = await getFeatures();
  if (!features.canOpen(key)) notFound();
  return features;
}
