"use server";

import { refresh } from "next/cache";
import { apiFetch } from "@/lib/api";
import { apiErrorMessage, readApiError } from "@/lib/api/errors";
import { getSession } from "@/lib/session";
import { isFeatureSlug } from "@/lib/features";
import {
  preferencePatchBody,
  type FeaturePreferences,
  type PreferenceChange,
} from "@/lib/feature-preferences";

const UNREACHABLE = "Couldn't reach the club's server. Your switch is back where it was.";

export interface PreferenceResult {
  ok: boolean;
  data?: FeaturePreferences;
  error?: string;
}

// Save one switch on /settings as the signed-in member. The API answers with
// the whole document, which the page takes as the truth.
export async function savePreferenceAction(change: PreferenceChange): Promise<PreferenceResult> {
  if (typeof change?.shown !== "boolean") return { ok: false, error: "That switch can't be saved." };
  if (change.kind === "feature" && !isFeatureSlug(change.key)) {
    return { ok: false, error: "That Feature isn't one you can hide." };
  }
  if (change.kind !== "feature" && change.kind !== "show_preview") {
    return { ok: false, error: "That switch can't be saved." };
  }

  const session = await getSession();
  if (!session) return { ok: false, error: "Sign in again to change your settings." };
  const userId = session.principal.discord_id;

  let res: Response;
  try {
    res = await apiFetch(`/api/v1/users/${encodeURIComponent(userId)}/feature_preferences`, {
      method: "PATCH",
      body: JSON.stringify(preferencePatchBody(change)),
    });
  } catch {
    return { ok: false, error: UNREACHABLE };
  }
  if (!res.ok) {
    if (res.status === 401) return { ok: false, error: "Sign in again to change your settings." };
    if (res.status === 403) return { ok: false, error: "You can only change your own settings." };
    return { ok: false, error: apiErrorMessage(await readApiError(res)) };
  }
  const body = (await res.json()) as { data: FeaturePreferences };
  // The sidebar, dashboard and sections read `shown` from the session, which
  // every render reads fresh (no-store). A preference is this member's alone,
  // so refreshing their router is enough: no cached data changed. The same
  // refresh re-reads /settings, and the form follows that read.
  refresh();
  return { ok: true, data: body.data };
}
