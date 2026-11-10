"use server";

import { revalidatePath, updateTag } from "next/cache";
import { apiFetch } from "@/lib/api";
import { apiErrorMessage, readApiError } from "@/lib/api/errors";
import { FEATURE_KEYS, type FeatureKey, type FeatureState } from "@/lib/features";
import { FEATURE_STATES, normalizeReason, type FeatureFlagEntry } from "@/lib/feature-flags";
import { getSession } from "@/lib/session";
import { isAdminOrAbove } from "@/lib/staff";

export interface FeatureFlagResult {
  ok: boolean;
  // The Feature's entry after the change, to replace its row.
  entry?: FeatureFlagEntry;
  // False when it already had that state (nothing logged or announced).
  changed?: boolean;
  error?: string;
}

const UNREACHABLE = "Couldn't reach the club's server. Try again.";

async function errorMessage(res: Response): Promise<string> {
  if (res.status === 401) return "Sign in again to change Feature Flags.";
  if (res.status === 403) return "Only Admins and Superadmins can change Feature Flags.";
  if (res.status === 404) return "That Feature no longer exists. Refresh the page.";
  return apiErrorMessage(await readApiError(res));
}

// Set one Feature Off, Preview or Live, with an optional reason. The API logs
// the change and queues its admin-channel announcement. The site reads the
// session's `features` on every load, so revalidating the layout is enough
// for the sidebar and pages to follow. The one cached read a flag gates is
// the logged-out landing's winners (tag `gotm`), so a Voting & GOTM change
// expires it here (api#351 hand-off).
export async function setFeatureFlagAction(
  key: FeatureKey,
  state: FeatureState,
  rawReason?: string | null,
): Promise<FeatureFlagResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Sign in again to change Feature Flags." };
  if (!isAdminOrAbove(session.membership)) {
    return { ok: false, error: "Only Admins and Superadmins can change Feature Flags." };
  }
  if (!FEATURE_KEYS.includes(key)) return { ok: false, error: "That isn't a Feature." };
  if (!FEATURE_STATES.includes(state)) return { ok: false, error: "Pick Off, Preview or Live." };
  const { reason, error } = normalizeReason(rawReason);
  if (error) return { ok: false, error };

  let res: Response;
  try {
    res = await apiFetch(`/api/v1/features/${encodeURIComponent(key)}`, {
      method: "PATCH",
      body: JSON.stringify({ data: { state, reason } }),
    });
  } catch {
    return { ok: false, error: UNREACHABLE };
  }
  if (!res.ok) return { ok: false, error: await errorMessage(res) };

  const body = (await res.json()) as { data: FeatureFlagEntry; meta?: { changed?: boolean } };
  const changed = body.meta?.changed !== false;
  if (changed) {
    if (key === "voting_gotm") updateTag("gotm");
    revalidatePath("/", "layout");
  }
  return { ok: true, entry: body.data, changed };
}
