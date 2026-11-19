"use server";

import { refresh } from "next/cache";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import { isPinKeyList, PIN_LIMIT } from "@/lib/pinned-pages";

export interface PinnedPagesResult {
  ok: boolean;
}

// Save the member's whole visible Pinned Pages list, in order, as the
// signed-in member. The API keeps the pins they can't see right now. The
// sidebar shows one message for any failure, so the reason isn't returned.
export async function savePinnedPagesAction(pages: string[]): Promise<PinnedPagesResult> {
  if (!isPinKeyList(pages) || pages.length > PIN_LIMIT) return { ok: false };

  const session = await getSession();
  if (!session) return { ok: false };
  const userId = session.principal.discord_id;

  try {
    const res = await apiFetch(`/api/v1/users/${encodeURIComponent(userId)}/pinned_pages`, {
      method: "PUT",
      body: JSON.stringify({ data: { pages } }),
    });
    if (!res.ok) return { ok: false };
  } catch {
    return { ok: false };
  }
  // The sidebar reads Pinned Pages from the session, which every render
  // reads fresh (no-store); the list is this member's alone, so refreshing
  // their router is enough.
  refresh();
  return { ok: true };
}

// Reset the member's Pinned Pages to the club default (ticket api#419): the
// API drops their saved list, so they follow the default again. Settings
// shows the one message for any failure.
export async function resetPinnedPagesAction(): Promise<PinnedPagesResult> {
  const session = await getSession();
  if (!session) return { ok: false };
  const userId = session.principal.discord_id;

  try {
    const res = await apiFetch(`/api/v1/users/${encodeURIComponent(userId)}/pinned_pages`, {
      method: "DELETE",
    });
    if (!res.ok) return { ok: false };
  } catch {
    return { ok: false };
  }
  // The sidebar's list and Settings' reset row both read the session.
  refresh();
  return { ok: true };
}
