"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import { UNREACHABLE, failure, validId } from "@/lib/api/codex-write";
import { CODEX_PATH } from "@/lib/codex/paths";
import { LINKS_MAX, cleanLinks } from "@/lib/codex/see-also";
import type { CodexEntryLink } from "@/lib/codex/types";

// Saving an entry's See also (www#127): `PUT /codex/entries/:id/links` with
// every entry it links to after the change, so removing one here removes
// the link from both entries. Whoever may edit the entry may change its
// links (the API says who); the forms save them after the entry itself, so
// a new entry has its id first.

export interface LinksActionResult {
  ok: boolean;
  links?: CodexEntryLink[];
  error?: string;
}

const GONE = "That entry is gone. Someone may have deleted it.";

export async function saveCodexLinksAction(id: number, entryIds: number[]): Promise<LinksActionResult> {
  if (!validId(id)) return { ok: false, error: GONE };
  if (!Array.isArray(entryIds) || !entryIds.every(validId)) return { ok: false, error: "Those links aren't entries." };
  const ids = [...new Set(entryIds)].filter((linked) => linked !== id);
  if (ids.length > LINKS_MAX) return { ok: false, error: `An entry links to at most ${LINKS_MAX} others.` };
  try {
    const res = await apiFetch(`/api/v1/codex/entries/${id}/links`, {
      method: "PUT",
      body: JSON.stringify({ data: { entry_ids: ids } }),
      cache: "no-store",
    });
    if (!res.ok) return failure(res, GONE);
    const body = (await res.json().catch(() => null)) as { data?: { links?: unknown } } | null;
    // Every Club Codex page can show a link to this entry.
    revalidatePath(CODEX_PATH, "layout");
    return { ok: true, links: cleanLinks(body?.data?.links) };
  } catch {
    return { ok: false, error: UNREACHABLE };
  }
}
