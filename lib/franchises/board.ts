import { compareGames, toRoman, type FranchiseEntry, type FranchiseLayout } from "./page";
import type { FranchiseGame } from "./types";

// The Franchise editor as a board of three zones (Make Room with a fixed
// order): Mainline, Spin-offs and Add-ons. A drag only changes a game's zone;
// inside Mainline and Spin-offs the order is release order (the numerals
// mean release order), so a dropped game settles into its place. Add-ons
// render grouped by their parent, wherever that parent is. Client-safe.

export type FranchiseZone = "mainline" | "other" | "addons";
export type FranchiseZones = Record<FranchiseZone, number[]>;

export const FRANCHISE_ZONE_NAMES: Record<FranchiseZone, string> = {
  mainline: "Mainline",
  other: "Spin-offs",
  addons: "Add-ons",
};

// Add-ons of games outside the Franchise (or not in GameDB), by parent.
export interface FranchiseStrayGroup {
  key: string;
  parent: string;
  games: FranchiseGame[];
}

export interface FranchiseBoardView {
  mainline: FranchiseEntry[];
  other: FranchiseEntry[];
  strays: FranchiseStrayGroup[];
  // Dropped into Add-ons and waiting for the member to pick its game.
  incoming: FranchiseGame[];
}

const entries = (layout: FranchiseLayout) => [...layout.mainline, ...layout.other];

// Every game on the page by id.
export function franchiseGamesById(layout: FranchiseLayout): Map<number, FranchiseGame> {
  const games = new Map<number, FranchiseGame>();
  for (const e of entries(layout)) {
    games.set(e.game_id, e);
    for (const a of e.addOns) games.set(a.game_id, a);
  }
  for (const group of layout.strays) for (const a of group.games) games.set(a.game_id, a);
  return games;
}

// The saved zones: Mainline and Spin-offs in release order, then every
// Add-on (those under a game on the page first, then the strays).
export function franchiseZones(layout: FranchiseLayout): FranchiseZones {
  return {
    mainline: layout.mainline.map((e) => e.game_id),
    other: layout.other.map((e) => e.game_id),
    addons: [
      ...entries(layout).flatMap((e) => e.addOns.map((a) => a.game_id)),
      ...layout.strays.flatMap((g) => g.games.map((a) => a.game_id)),
    ],
  };
}

// What to draw for `zones` (live while dragging): each game in its zone,
// Mainline numbered by place, each parent with the Add-ons still under it.
// Groups keep the page's order, so a drag inside Add-ons never reshuffles.
export function franchiseBoardView(layout: FranchiseLayout, zones: FranchiseZones): FranchiseBoardView {
  const games = franchiseGamesById(layout);
  const inAddons = new Set(zones.addons);
  const addOnsOf = new Map(entries(layout).map((e) => [e.game_id, e.addOns]));
  const original = new Set([...addOnsOf.values(), ...layout.strays.map((g) => g.games)].flat().map((a) => a.game_id));
  const pick = (ids: number[]) => ids.map((id) => games.get(id)).filter((g): g is FranchiseGame => !!g);
  const entry = (g: FranchiseGame, numeral: string | null): FranchiseEntry => ({
    ...g,
    numeral,
    addOns: (addOnsOf.get(g.game_id) ?? []).filter((a) => inAddons.has(a.game_id)),
  });
  return {
    mainline: pick(zones.mainline).map((g, i) => entry(g, toRoman(i + 1))),
    other: pick(zones.other).map((g) => entry(g, null)),
    strays: layout.strays
      .map((group, i) => ({
        key: group.parent ? String(group.parent.game_id) : `none-${i}`,
        parent: group.parent?.title ?? group.games[0]?.parent_game_name ?? "A game not in GameDB",
        games: group.games.filter((a) => inAddons.has(a.game_id)),
      }))
      .filter((group) => group.games.length > 0),
    incoming: pick(zones.addons.filter((id) => !original.has(id))),
  };
}

// `zones` with Mainline and Spin-offs back in release order, for showing a
// drop before the page reads itself again.
export function settleZones(layout: FranchiseLayout, zones: FranchiseZones): FranchiseZones {
  const games = franchiseGamesById(layout);
  const byRelease = (a: number, b: number) => {
    const ga = games.get(a);
    const gb = games.get(b);
    return ga && gb ? compareGames(ga, gb) : 0;
  };
  return { ...zones, mainline: [...zones.mainline].sort(byRelease), other: [...zones.other].sort(byRelease) };
}

// What a game with its own Add-ons can't become: an Add-on (no nesting).
export function canDropInZone(view: FranchiseBoardView, id: number, to: FranchiseZone): boolean {
  if (to !== "addons") return true;
  return ![...view.mainline, ...view.other].some((e) => e.game_id === id && e.addOns.length > 0);
}

export interface FranchiseLinkData {
  mainline?: boolean;
  parent_game_id?: number | null;
}

export type FranchiseMovePlan =
  | { kind: "none" }
  | { kind: "save"; data: FranchiseLinkData }
  | { kind: "pick-parent" };

// What a drop from one zone to another saves. Into Add-ons asks which game
// it's an Add-on of first; out of Add-ons clears the parent.
export function planFranchiseMove(from: FranchiseZone, to: FranchiseZone): FranchiseMovePlan {
  if (to === "addons") return { kind: "pick-parent" };
  if (from === to) return { kind: "none" };
  const mainline = to === "mainline";
  return { kind: "save", data: from === "addons" ? { parent_game_id: null, mainline } : { mainline } };
}

const validId = (id: number) => Number.isInteger(id) && id > 0;

// The body of PUT /franchises/:id/games/:game_id: `mainline` when given,
// `parent_game_id` (a GameDB id, or null to clear) when given.
export function franchiseLinkData(
  gameId: number,
  mainline?: boolean,
  parentGameId?: number | null,
): { data: FranchiseLinkData } | { error: string } {
  const data: FranchiseLinkData = {};
  if (parentGameId !== undefined) {
    if (parentGameId !== null && !validId(parentGameId)) return { error: "Pick the game it's an Add-on of." };
    if (parentGameId === gameId) return { error: "A game can't be an Add-on of itself." };
    data.parent_game_id = parentGameId;
  }
  if (mainline !== undefined) data.mainline = mainline;
  return { data };
}
