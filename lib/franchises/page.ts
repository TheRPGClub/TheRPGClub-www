import type { FranchiseAddOnGroup, FranchiseChange, FranchiseGame, FranchisePage } from "./types";

// The Franchise page's shape (design pick 6, "the numbered run and the box
// set"): the Mainline games as a numbered run, the Other games in the box
// set, and each Add-on clipped under its parent when the parent is on the
// page. Client-safe.

export interface FranchiseEntry extends FranchiseGame {
  // The Roman numeral of a Mainline game: its place by release, not a rank.
  numeral: string | null;
  addOns: FranchiseGame[];
}

export interface FranchiseLayout {
  mainline: FranchiseEntry[];
  other: FranchiseEntry[];
  // Add-ons whose parent isn't in this Franchise (or not in GameDB), by
  // parent.
  strays: FranchiseAddOnGroup[];
  counts: { mainline: number; other: number; addOns: number; manual: number };
}

const ROMAN: [number, string][] = [
  [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"],
  [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
];

export function toRoman(n: number): string {
  if (!Number.isInteger(n) || n <= 0) return "";
  let rest = n;
  let out = "";
  for (const [value, glyph] of ROMAN) {
    while (rest >= value) {
      out += glyph;
      rest -= value;
    }
  }
  return out;
}

export function franchiseLayout(page: FranchisePage): FranchiseLayout {
  const byParent = new Map<number, FranchiseGame[]>();
  const strays: FranchiseAddOnGroup[] = [];
  const onPage = new Set([...page.games.mainline, ...page.games.other].map((g) => g.game_id));
  for (const group of page.games.add_ons) {
    if (group.games.length === 0) continue;
    if (group.parent && onPage.has(group.parent.game_id)) byParent.set(group.parent.game_id, group.games);
    else strays.push(group);
  }
  const entry = (g: FranchiseGame, numeral: string | null): FranchiseEntry => ({
    ...g,
    numeral,
    addOns: byParent.get(g.game_id) ?? [],
  });
  const addOns = page.games.add_ons.flatMap((g) => g.games);
  const all = [...page.games.mainline, ...page.games.other, ...addOns];
  return {
    mainline: page.games.mainline.map((g, i) => entry(g, toRoman(i + 1))),
    other: page.games.other.map((g) => entry(g, null)),
    strays,
    counts: {
      mainline: page.games.mainline.length,
      other: page.games.other.length,
      addOns: addOns.length,
      manual: all.filter((g) => g.source === "manual").length,
    },
  };
}

// The API's order: oldest release first (undated last), then title.
export function compareGames(a: Pick<FranchiseGame, "release_year" | "title">, b: Pick<FranchiseGame, "release_year" | "title">): number {
  const ya = a.release_year ?? Number.POSITIVE_INFINITY;
  const yb = b.release_year ?? Number.POSITIVE_INFINITY;
  if (ya !== yb) return ya < yb ? -1 : 1;
  return a.title.localeCompare(b.title);
}

// A section's entries with the games unlinked while editing put back in
// their place (greyed, `gone`), so an editor can link them again from where
// they were. An unlinked game goes back to the section it was in.
export function withGone(
  entries: FranchiseEntry[],
  unlinked: FranchiseGame[],
  mainline: boolean,
): (FranchiseEntry & { gone: boolean })[] {
  const here = new Set(entries.map((e) => e.game_id));
  const gone = unlinked
    .filter((g) => g.mainline === mainline && !here.has(g.game_id))
    .map((g) => ({ ...g, numeral: null, addOns: [], gone: true }));
  return [...entries.map((e) => ({ ...e, gone: false })), ...gone].sort(compareGames);
}

// A history row as words: plain text with the names in `strong` parts.
export type ChangePart = { text: string; strong?: boolean };

function str(v: unknown): string | null {
  return typeof v === "string" && v ? v : null;
}

export function describeChange(change: FranchiseChange): ChangePart[] {
  const game: ChangePart = { text: change.game_title ?? "a game that has left GameDB", strong: !!change.game_title };
  switch (change.action) {
    case "link":
      return [{ text: "linked " }, game];
    case "unlink":
      return [{ text: "unlinked " }, game];
    case "mainline_on":
      return [{ text: "marked " }, game, { text: " Mainline" }];
    case "mainline_off":
      return [{ text: "moved " }, game, { text: " to Spin-offs" }];
    case "create":
      return [{ text: "created this Franchise" }];
    case "rename": {
      const from = str(change.before?.name);
      const to = str(change.after?.name);
      if (!from || !to) return [{ text: "renamed this Franchise" }];
      return [{ text: "renamed " }, { text: from, strong: true }, { text: " to " }, { text: to, strong: true }];
    }
    case "merge": {
      const from = str(change.before?.name);
      return from
        ? [{ text: "merged " }, { text: from, strong: true }, { text: " into this Franchise" }]
        : [{ text: "merged a Franchise into this one" }];
    }
    case "delete":
      return [{ text: "deleted this Franchise" }];
  }
}

// What the row offers: Undo, a "Can't undo" note for the kinds that never
// undo, or nothing (undone already, or a later change stands in the way).
export function changeUndo(change: FranchiseChange): "undo" | "never" | "none" {
  if (change.undone_at) return "none";
  if (change.can_undo) return "undo";
  return change.action === "create" || change.action === "merge" || change.action === "delete" ? "never" : "none";
}

// When a change was made: "3 h ago" in its first week, then the date.
export function changeWhen(iso: string, now: Date): string {
  const at = new Date(iso);
  const days = (now.getTime() - at.getTime()) / 86_400_000;
  if (days < 7) {
    const minutes = Math.max(0, Math.floor(days * 1440));
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} h ago`;
    return `${Math.floor(days)} d ago`;
  }
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(at);
}
