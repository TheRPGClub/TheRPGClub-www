import type { FranchiseGame, FranchisePage } from "@/lib/franchises/types";
import { compareGames } from "@/lib/franchises/page";
import type { FranchiseRole, GameParent } from "./franchises";

// The context card (design pick edit-cards, www#208): each Franchise in a
// role lane shows its run in that role, the game ringed in its place, or in
// the place it will land when the link or move is only staged. Client-safe.

// The game being edited, as a tile on a run.
export interface CardGame {
  game_id: number;
  title: string;
  cover_url: string | null;
  release_year: number | null;
}

export interface RunTile extends CardGame {
  me: boolean;
}

export interface CardRun {
  // What the run is: "Mainline, by release", "Add-ons of Final Fantasy VII".
  label: string;
  // The tiles around the game (at most `reach` either side of it).
  tiles: RunTile[];
  // Games of the run left off either end.
  before: number;
  after: number;
  // The game's place in the whole run (1-based) and the run's length.
  place: number;
  total: number;
  // The game isn't in the run yet: the place is where a save puts it.
  landing: boolean;
}

export interface FranchiseCounts {
  games: number;
  mainline: number;
  spinoffs: number;
  addOns: number;
}

export function franchiseCounts(page: FranchisePage): FranchiseCounts {
  const mainline = page.games.mainline.length;
  const spinoffs = page.games.other.length;
  const addOns = page.games.add_ons.reduce((n, g) => n + g.games.length, 0);
  return { games: mainline + spinoffs + addOns, mainline, spinoffs, addOns };
}

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

// "31 games · 16 Mainline · 15 Spin-offs", Add-ons only when there are some.
export function countsLine(c: FranchiseCounts): string {
  const parts = [plural(c.games, "game"), `${c.mainline} Mainline`, plural(c.spinoffs, "Spin-off")];
  if (c.addOns > 0) parts.push(plural(c.addOns, "Add-on"));
  return parts.join(" · ");
}

// The Add-ons of the game's parent in this Franchise. A loaded parent has
// only its name, so it is the group the game is in, else the group of that
// name; a picked parent is found by its id.
function addOnGroup(page: FranchisePage, gameId: number, parent: GameParent | null): FranchiseGame[] {
  if (!parent) return [];
  const groups = page.games.add_ons;
  const group =
    parent.game_id != null
      ? groups.find((g) => g.parent?.game_id === parent.game_id)
      : (groups.find((g) => g.games.some((a) => a.game_id === gameId)) ?? groups.find((g) => g.parent?.title === parent.name));
  return group?.games ?? [];
}

// The Franchise's run in `role` with the game in it: where it is, or where
// a save will put it (by release, as the Franchise page orders games).
export function franchiseCardRun(
  page: FranchisePage | null,
  role: FranchiseRole,
  game: CardGame,
  parent: GameParent | null,
  reach = 6,
): CardRun {
  const source: FranchiseGame[] = !page
    ? []
    : role === "mainline"
      ? page.games.mainline
      : role === "spinoff"
        ? page.games.other
        : addOnGroup(page, game.game_id, parent);
  const label =
    role === "mainline" ? "Mainline, by release" : role === "spinoff" ? "Spin-offs, by release" : `Add-ons of ${parent?.name ?? "its parent game"}`;
  const at = source.findIndex((g) => g.game_id === game.game_id);
  const landing = at < 0;
  const run: RunTile[] = source.map((g) => ({
    game_id: g.game_id,
    title: g.title,
    cover_url: g.cover_url,
    release_year: g.release_year,
    me: g.game_id === game.game_id,
  }));
  let index = at;
  if (landing) {
    const me = { ...game, me: true };
    index = run.findIndex((g) => compareGames(me, g) < 0);
    if (index < 0) index = run.length;
    run.splice(index, 0, me);
  }
  const from = Math.max(0, index - reach);
  const to = Math.min(run.length, index + reach + 1);
  return {
    label,
    tiles: run.slice(from, to),
    before: from,
    after: run.length - to,
    place: index + 1,
    total: run.length,
    landing,
  };
}

// "1st", "2nd", "3rd", "11th".
export function ordinal(n: number): string {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  return `${n}${({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th"}`;
}

// What a screen reader hears on the ringed tile.
export function placeSentence(run: CardRun): string {
  const where = `${ordinal(run.place)} of ${run.total}`;
  return run.landing ? `This game lands here on Save: ${where}.` : `This game, ${where}.`;
}
