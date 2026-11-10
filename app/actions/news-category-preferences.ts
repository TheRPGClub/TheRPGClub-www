"use server";

import { refresh, updateTag } from "next/cache";
import { apiFetch } from "@/lib/api";
import { apiErrorMessage, readApiError } from "@/lib/api/errors";
import { getSession } from "@/lib/session";
import {
  isNewsCategorySlug,
  newsCategoryPatchBody,
  newsFeedTag,
  type NewsCategoryChange,
  type NewsCategoryPreferences,
} from "@/lib/news-category-preferences";

const UNREACHABLE = "Couldn't reach the club's server. Your switch is back where it was.";

export interface NewsCategoryResult {
  ok: boolean;
  data?: NewsCategoryPreferences;
  error?: string;
}

// Save one News Category switch on /settings as the signed-in member. The API
// answers with the whole document, which the page takes as the truth.
export async function saveNewsCategoryAction(change: NewsCategoryChange): Promise<NewsCategoryResult> {
  if (typeof change?.on !== "boolean" || !isNewsCategorySlug(change.key)) {
    return { ok: false, error: "That switch can't be saved." };
  }

  const session = await getSession();
  if (!session) return { ok: false, error: "Sign in again to change your settings." };
  const userId = session.principal.discord_id;

  let res: Response;
  try {
    res = await apiFetch(`/api/v1/users/${encodeURIComponent(userId)}/news_category_preferences`, {
      method: "PATCH",
      body: JSON.stringify(newsCategoryPatchBody(change)),
    });
  } catch {
    return { ok: false, error: UNREACHABLE };
  }
  if (!res.ok) {
    if (res.status === 401) return { ok: false, error: "Sign in again to change your settings." };
    if (res.status === 403) return { ok: false, error: "You can only change your own settings." };
    // The News Hub is gated: 404 once it is Off for this member.
    if (res.status === 404) return { ok: false, error: "The News Hub isn't open to you right now." };
    return { ok: false, error: apiErrorMessage(await readApiError(res)) };
  }
  const body = (await res.json()) as { data: NewsCategoryPreferences };
  // The News page's default view follows these: expire this member's cached
  // feed so the next load reads the new default. Refreshing re-reads
  // /settings, and the switches follow the API's document.
  updateTag(newsFeedTag(userId));
  refresh();
  return { ok: true, data: body.data };
}
