import "server-only";
import { cache } from "react";
import { apiFetch } from "@/lib/api";
import type { Hltb } from "@/lib/hltb";

// The game's saved HowLongToBeat times (the profile's `hltb` slice, no
// scrape): null when there are none, undefined when the read failed. Read
// once per request, so the game page's hero panel can start it early and
// GameHltb picks up the same read.
export const fetchSavedHltb = cache(async (gameId: number): Promise<Hltb | null | undefined> => {
  try {
    const res = await apiFetch(`/api/v1/games/${gameId}/profile`, { cache: "no-store" });
    if (!res.ok) return undefined;
    const body = (await res.json()) as { data?: { hltb?: Hltb | null } };
    return body.data?.hltb ?? null;
  } catch {
    return undefined;
  }
});
