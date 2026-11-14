import { apiFetch } from "@/lib/api";
import type { FeaturePreferences } from "@/lib/feature-preferences";

// The member's own Feature Preferences for /settings, read fresh: a flip
// elsewhere (another tab, a flag change) shows on the next load. Null when
// the read failed.
export async function fetchFeaturePreferences(userId: string): Promise<FeaturePreferences | null> {
  try {
    const res = await apiFetch(`/api/v1/users/${encodeURIComponent(userId)}/feature_preferences`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: FeaturePreferences };
    return body.data ?? null;
  } catch {
    return null;
  }
}
