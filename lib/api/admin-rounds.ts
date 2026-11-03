import { apiFetch } from "@/lib/api";
import type { GotmEntry, GotmRound, GotmRoundsMeta, NrGotmEntry, VotingCategory } from "./types";
import { VOTING_CATEGORY_PATH } from "./voting-round";

// Reads for /admin/rounds. Uncached, unlike the public GOTM history: an
// Admin who just added or edited a round must see it at once.

export const ADMIN_ROUNDS_PER_PAGE = 12;

export interface AdminRoundsPage {
  rounds: GotmRound[];
  meta: GotmRoundsMeta | null;
}

// Both tracks by round, newest first. Null when the read failed.
export async function fetchAdminRounds(page: number): Promise<AdminRoundsPage | null> {
  try {
    const res = await apiFetch(
      `/api/v1/gotm_rounds?kind=both&sort=desc&per=${ADMIN_ROUNDS_PER_PAGE}&page=${page}`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    const body = (await res.json()) as { data: GotmRound[]; meta: GotmRoundsMeta };
    return { rounds: body.data ?? [], meta: body.meta ?? null };
  } catch {
    return null;
  }
}

export type AdminRoundEntry = GotmEntry | NrGotmEntry;

// One track's entries for a round, with their games, in slot order. Null
// when the read failed; an empty list when the round has none.
export async function fetchRoundEntries(
  category: VotingCategory,
  round: number,
): Promise<AdminRoundEntry[] | null> {
  try {
    const res = await apiFetch(
      `/api/v1/${VOTING_CATEGORY_PATH[category]}?round_number=${round}&include=game&per=100`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    const body = (await res.json()) as { data: AdminRoundEntry[] };
    return [...(body.data ?? [])].sort((a, b) => a.game_index - b.game_index);
  } catch {
    return null;
  }
}
