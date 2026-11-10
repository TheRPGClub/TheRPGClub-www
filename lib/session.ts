import { cache, type ReactNode } from "react";
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

// A Feature's own pages are gated once, by their route segment's layout:
//
//   // app/(app)/giveaways/layout.tsx
//   export default featureLayout("giveaways");
//
// The whole subtree is not-found when the Feature's flag hides it from this
// viewer. A Feature the member hid by preference still renders, so a shared
// link keeps working. The layout sits outside every page's Suspense boundary,
// so a not-found there still answers 404. Pages read `getFeatures()` for
// their Preview badge.
export function featureLayout(key: FeatureKey) {
  return async function FeatureLayout({ children }: { children: ReactNode }) {
    if (!(await getFeatures()).canOpen(key)) notFound();
    return children;
  };
}
