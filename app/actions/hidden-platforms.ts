"use server";

import { refresh, updateTag } from "next/cache";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import {
  HIDDEN_PLATFORMS_NOT_SAVED,
  isPlatformIdList,
  upcomingReleasesTag,
  type HiddenPlatforms,
} from "@/lib/hidden-platforms";

export interface HiddenPlatformsResult {
  ok: boolean;
  data?: HiddenPlatforms;
  error?: string;
}

// Save the member's whole Hidden Platforms set (the API replaces it), from
// /releases or /settings. The API's answer is the new list.
export async function saveHiddenPlatformsAction(platformIds: number[]): Promise<HiddenPlatformsResult> {
  if (!isPlatformIdList(platformIds)) return { ok: false, error: HIDDEN_PLATFORMS_NOT_SAVED };
  const session = await getSession();
  if (!session)
    return {
      ok: false,
      error: "Sign in again to change your Hidden Platforms.",
    };
  const userId = session.principal.discord_id;

  let res: Response;
  try {
    res = await apiFetch(`/api/v1/users/${encodeURIComponent(userId)}/hidden_platforms`, {
      method: "PUT",
      body: JSON.stringify({ data: { platform_ids: platformIds } }),
    });
  } catch {
    return {
      ok: false,
      error: "Couldn't reach the club's server. Nothing changed.",
    };
  }
  if (!res.ok) {
    if (res.status === 401)
      return {
        ok: false,
        error: "Sign in again to change your Hidden Platforms.",
      };
    if (res.status === 404)
      return {
        ok: false,
        error: "The Release Calendar isn't open to you right now.",
      };
    // A 422's `error` is a sentence for the member ("unknown platform: 9").
    if (res.status === 422)
      return {
        ok: false,
        error: (await refusal(res)) ?? HIDDEN_PLATFORMS_NOT_SAVED,
      };
    return { ok: false, error: HIDDEN_PLATFORMS_NOT_SAVED };
  }
  const body = (await res.json().catch(() => null)) as {
    data?: HiddenPlatforms;
  } | null;
  // The calendar's reads are cached per member for a minute: expire them so
  // the next load is filtered by the new set. Refreshing re-reads the page.
  updateTag(upcomingReleasesTag(userId));
  refresh();
  return { ok: true, data: body?.data };
}

async function refusal(res: Response): Promise<string | undefined> {
  const body: unknown = await res.json().catch(() => null);
  const error = body && typeof body === "object" && "error" in body ? body.error : null;
  return typeof error === "string" && error.trim() ? error.trim() : undefined;
}
