import { emptyDraft, type ChallengeDraft, type DraftGame } from "@/lib/challenges/form";
import type { FranchisePage } from "@/lib/franchises/types";
import type { GameList } from "@/lib/game-lists/types";

// "Start a Challenge" from a Game List or a Franchise (www#172): a new Pool
// draft the Challenge form opens on. Client-safe and pure.

const asDraft = (g: { game_id: number; title: string; cover_url?: string | null }): DraftGame => ({
  game_id: g.game_id,
  title: g.title,
  cover_url: g.cover_url ?? null,
});

// Who may start a Challenge from a list (api#448): its owner, hosting it
// themselves; staff, from a club list, for a club-hosted Challenge. Never
// from a list that already feeds a Challenge: one list, one Challenge, so
// games added to it later always land in that Challenge.
export function canStartFromList(
  list: Pick<GameList, "club" | "owner" | "challenge">,
  viewer: { id: string; staff: boolean },
): boolean {
  if (list.challenge) return false;
  return list.club ? viewer.staff : list.owner?.user_id === viewer.id;
}

// The list's games become Core in its own order, and the list stays linked,
// so games added to it later arrive as Optional Games. A club list makes a
// club-hosted Challenge.
export function draftFromList(list: GameList): ChallengeDraft {
  return {
    ...emptyDraft(),
    format: "pool",
    name: list.name,
    hostedByClub: list.club,
    core: (list.entries ?? []).map((entry) => asDraft({ ...entry.game, game_id: entry.game_id })),
    gameList: { id: list.id, name: list.name },
  };
}

// Every Mainline game comes in as Core (the owner's default: the Host moves
// any they don't want), and the Franchise is a source, so its other games
// are Optional. Add-ons stay out, as sources never bring them.
export function draftFromFranchise(page: FranchisePage): ChallengeDraft {
  const { mainline, other } = page.games;
  return {
    ...emptyDraft(),
    format: "pool",
    name: page.name,
    sources: [{ kind: "franchise", id: page.franchise_id, name: page.name, game_count: mainline.length + other.length }],
    core: mainline.map(asDraft),
  };
}
