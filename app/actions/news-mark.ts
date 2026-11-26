"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { putNewsMark } from "@/lib/api/news-mark";
import { NEWS_PATH } from "@/lib/news";
import { newsFeedTag } from "@/lib/news-category-preferences";
import { getSession } from "@/lib/session";

export interface MarkAllSeenState {
  error: string | null;
}

// Mark all seen (ticket www#222): moves the member's News Mark to now and
// goes back to the News page (Catch-up, as it was filtered), which reads as
// caught up. A plain form post without JavaScript; with it, the redirect is a
// client navigation, so no full reload.
// `back` is the News page address to go back to, bound by the form;
// useActionState's previous state and the form data aren't needed.
export async function markAllSeenAction(back: string): Promise<MarkAllSeenState> {
  const session = await getSession();
  if (!session) return { error: "Sign in again to mark the news seen." };
  const userId = session.principal.discord_id;

  const status = await putNewsMark(userId, { all_seen: true });
  if (status === null) return { error: "Couldn't reach the club's server. Try again in a moment." };
  if (status === 404) return { error: "The News Hub isn't open to you right now." };
  if (status < 200 || status >= 300) return { error: "Couldn't mark the news seen. Try again in a moment." };

  updateTag(newsFeedTag(userId));
  redirect(backTo(back));
}

// Only back to the News page itself, never elsewhere.
function backTo(back: unknown): string {
  if (typeof back !== "string") return NEWS_PATH;
  return back === NEWS_PATH || back.startsWith(`${NEWS_PATH}?`) ? back : NEWS_PATH;
}
