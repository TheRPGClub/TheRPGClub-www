import "server-only";
import { apiFetch } from "@/lib/api";
import type { Hltb } from "@/lib/hltb";

// The game's saved HowLongToBeat times (the profile's `hltb` slice, no
// scrape): null when there are none, undefined when the read failed.
export async function fetchSavedHltb(gameId: number): Promise<Hltb | null | undefined> {
  try {
    const res = await apiFetch(`/api/v1/games/${gameId}/profile`, { cache: "no-store" });
    if (!res.ok) return undefined;
    const body = (await res.json()) as { data?: { hltb?: Hltb | null } };
    return body.data?.hltb ?? null;
  } catch {
    return undefined;
  }
}
