import type { ChallengeDraft, DraftGame } from "@/lib/challenges/form";
import type { PoolGame } from "@/lib/challenges/types";

// The Pool editor (www#170, design pick 8) as plain data: which games are
// Core, which Optional and which Left out, and the moves between them. Core
// Games are only ever the draft's own `core` (ADR 0014: only a person makes a
// game Core). Optional Games are the sources' games, as the preview resolves
// them, plus the games picked by hand and the linked Game List's games, less
// Core and Left out. Client-safe and pure.

export type PoolSide = "core" | "optional";

export interface EditorGame extends DraftGame {
  // "new" joined the saved Pool in the last 14 days; "added" was picked by
  // hand as an Optional Game.
  tag: "new" | "added" | null;
}

export interface PoolColumns {
  core: EditorGame[];
  optional: EditorGame[];
  leftOut: DraftGame[];
  // How many Optional Games the Pool has now (more than `optional` holds
  // when the sources have more games than one preview page).
  optionalCount: number;
  // Games a source brings (a Franchise, a Series or the linked list), so a
  // game moved out of Core or put back needs no hand pick to stay.
  sourceIds: Set<number>;
}

// The draft's games from sources, as the preview answered (the sources and
// the hand-picked Optional Games, never Core or Left out, so a source's game
// that is Core or Left out still shows in it).
export interface SourcePreview {
  games: PoolGame[];
  total: number;
}

const ids = (games: readonly { game_id: number }[]) => new Set(games.map((g) => g.game_id));
const asDraft = (g: DraftGame | PoolGame): DraftGame => ({
  game_id: g.game_id,
  title: g.title,
  cover_url: g.cover_url ?? null,
});

// The linked Game List's games, as the saved Challenge served them (the
// preview can't resolve a list).
export function listGamesOf(draft: ChallengeDraft): DraftGame[] {
  return draft.savedOptional.filter((g) => g.source === "list").map(asDraft);
}

export function poolColumns(draft: ChallengeDraft, preview: SourcePreview | null): PoolColumns {
  const core = ids(draft.core);
  const out = ids(draft.excluded);
  const hand = ids(draft.optional);
  const fresh = new Set(draft.savedOptional.filter((g) => g.new).map((g) => g.game_id));
  const fromList = listGamesOf(draft);
  const previewed = preview?.games ?? [];
  const sourceIds = new Set([...previewed.filter((g) => !hand.has(g.game_id)).map((g) => g.game_id), ...ids(fromList)]);
  const seen = new Set<number>();
  const optional: EditorGame[] = [];
  for (const game of [...previewed, ...draft.optional, ...fromList]) {
    if (seen.has(game.game_id) || core.has(game.game_id) || out.has(game.game_id)) continue;
    seen.add(game.game_id);
    optional.push({
      ...asDraft(game),
      tag: fresh.has(game.game_id) ? "new" : hand.has(game.game_id) ? "added" : null,
    });
  }
  const unseen = preview ? Math.max(0, preview.total - previewed.length) : 0;
  return {
    core: draft.core.map((g) => ({ ...g, tag: null })),
    optional,
    leftOut: draft.excluded,
    optionalCount: optional.length + unseen,
    sourceIds,
  };
}

export function sideOf(draft: ChallengeDraft, gameId: number): PoolSide | "out" | null {
  if (draft.core.some((g) => g.game_id === gameId)) return "core";
  if (draft.excluded.some((g) => g.game_id === gameId)) return "out";
  if (draft.optional.some((g) => g.game_id === gameId)) return "optional";
  return null;
}

const without = (games: readonly DraftGame[], gameId: number) => games.filter((g) => g.game_id !== gameId);

// Put a game in Core or Optional, from anywhere (a search, the other
// section, Left out). An Optional Game no source brings is picked by hand.
export function moveGame(
  draft: ChallengeDraft,
  game: DraftGame,
  to: PoolSide,
  sourceIds: ReadonlySet<number>,
): ChallengeDraft {
  const id = game.game_id;
  const rest = {
    core: without(draft.core, id),
    optional: without(draft.optional, id),
    excluded: without(draft.excluded, id),
  };
  if (to === "core") return { ...draft, ...rest, core: [...rest.core, asDraft(game)] };
  const byHand = !sourceIds.has(id) || draft.optional.some((g) => g.game_id === id);
  return { ...draft, ...rest, optional: byHand ? [...rest.optional, asDraft(game)] : rest.optional };
}

// Leave a game out: out of Core and the hand picks, and kept out though a
// source brings it, until it is put back.
export function leaveOut(draft: ChallengeDraft, game: DraftGame): ChallengeDraft {
  const id = game.game_id;
  return {
    ...draft,
    core: without(draft.core, id),
    optional: without(draft.optional, id),
    excluded: [...without(draft.excluded, id), asDraft(game)],
  };
}

// Put a Left out game back as an Optional Game.
export function putBack(draft: ChallengeDraft, game: DraftGame, sourceIds: ReadonlySet<number>): ChallengeDraft {
  return moveGame(draft, game, "optional", sourceIds);
}

// The Optional target never goes below 0. It may go above the Optional
// count, which shows the target error at once.
export function stepTarget(draft: ChallengeDraft, delta: number): ChallengeDraft {
  return { ...draft, optionalTarget: Math.max(0, Math.trunc(draft.optionalTarget + delta)) };
}

export function setTarget(draft: ChallengeDraft, value: number): ChallengeDraft {
  return { ...draft, optionalTarget: Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0 };
}

// What's wrong with the goal: nothing to Clear (shown on save), or a target
// above the Optional Games (shown at once). `optionalCount` is null while
// unknown.
export function goalErrors(
  draft: Pick<ChallengeDraft, "core" | "optionalTarget">,
  optionalCount: number | null,
): { empty?: string; target?: string } {
  const errors: { empty?: string; target?: string } = {};
  if (draft.core.length === 0 && draft.optionalTarget < 1)
    errors.empty = "Add a Core Game, or ask for at least 1 Optional Game.";
  if (optionalCount !== null && draft.optionalTarget > optionalCount)
    errors.target = `Only ${optionalCount} Optional ${optionalCount === 1 ? "Game" : "Games"}. Lower the target or add more.`;
  return errors;
}
