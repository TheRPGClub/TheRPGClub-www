// The /franchises index (spec api#487, www#206): its URL and its tiles as
// GET /api/v1/franchises/browse sends them (api#488). Client-safe.

export const FRANCHISES_PATH = "/franchises";

// A Franchise's box set on the index.
export interface FranchiseTile {
  franchise_id: number;
  name: string;
  // Every linked game.
  games_count: number;
  mainline_count: number;
  spin_off_count: number;
  add_on_count: number;
  first_year: number | null;
  latest_year: number | null;
  // Now Playing plus Game Completions in the last 90 days.
  club_plays: number;
  // Up to three: newest Mainline first, then Spin-offs, newest first.
  covers: { game_id: number; title: string; cover_url: string }[];
  // The viewer's Mainline finished of the total; only where the
  // `franchise_progress` Feature is open to them.
  progress?: { done: number; total: number };
}

export type FranchiseSort = "az" | "games" | "plays";

export const FRANCHISE_SORTS: readonly [FranchiseSort, string][] = [
  ["az", "A–Z"],
  ["games", "Most games"],
  ["plays", "Club plays"],
];

// The letter rail: "#" is every name that doesn't start with a letter.
export const LETTERS: readonly string[] = [
  "#",
  ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ",
];

export interface BrowseQuery {
  q: string;
  letter: string | null;
  sort: FranchiseSort;
  page: number;
}

type RawParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

// The URL's query, with anything the API would refuse dropped rather than
// failing the page.
export function parseBrowseQuery(params: RawParams): BrowseQuery {
  const sort = first(params.sort);
  const letter = first(params.letter)?.toUpperCase() ?? null;
  const page = parseInt(first(params.page) ?? "1", 10);
  return {
    q: (first(params.q) ?? "").trim(),
    letter: letter && LETTERS.includes(letter) ? letter : null,
    sort: sort === "games" || sort === "plays" ? sort : "az",
    page: Number.isFinite(page) && page > 1 ? page : 1,
  };
}

// The index's URL: each part left out when it says nothing (A-Z and page
// one stay bare).
export function browseHref(query: Partial<BrowseQuery>): string {
  const ps = new URLSearchParams();
  if (query.q?.trim()) ps.set("q", query.q.trim());
  if (query.letter) ps.set("letter", query.letter);
  if (query.sort && query.sort !== "az") ps.set("sort", query.sort);
  if (query.page && query.page > 1) ps.set("page", String(query.page));
  return `${FRANCHISES_PATH}${ps.size ? `?${ps}` : ""}`;
}

// What an empty wall says, and the way back: a page past the end goes to
// page one, an empty search or letter to every Franchise.
export function emptyWall(query: BrowseQuery): {
  text: string;
  action: { href: string; label: string } | null;
} {
  if (query.page > 1)
    return {
      text: `Page ${query.page} is past the last page.`,
      action: { href: browseHref({ ...query, page: 1 }), label: "Go to page 1" },
    };
  const every = { href: browseHref({ sort: query.sort }), label: "Show every Franchise" };
  if (query.q) return { text: `No Franchise matches “${query.q}”.`, action: every };
  if (query.letter)
    return {
      text: `No Franchise starts with ${query.letter === "#" ? "anything but a letter" : query.letter}.`,
      action: every,
    };
  return { text: "No Franchises yet.", action: null };
}

// The API read's query for a page of tiles.
export function browseApiPath(query: BrowseQuery, per: number): string {
  const ps = new URLSearchParams({
    sort: query.sort,
    page: String(query.page),
    per: String(per),
  });
  if (query.q) ps.set("q", query.q);
  if (query.letter) ps.set("letter", query.letter);
  return `/api/v1/franchises/browse?${ps}`;
}

const plural = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`;

// "24 Mainline · 33 Games · 12 Add-ons", the tile's line, in its parts.
export function tileCounts(tile: FranchiseTile): string[] {
  return [
    `${tile.mainline_count} Mainline`,
    plural(tile.games_count, "Game", "Games"),
    plural(tile.add_on_count, "Add-on", "Add-ons"),
  ];
}

// "16 Mainline · 15 Spin-offs · 8 Add-ons", the paper tag's line, in its
// parts.
export function tagCounts(tile: FranchiseTile): string[] {
  return [
    `${tile.mainline_count} Mainline`,
    plural(tile.spin_off_count, "Spin-off", "Spin-offs"),
    plural(tile.add_on_count, "Add-on", "Add-ons"),
  ];
}

// "1997–2025", one year alone, or null with none known.
export function yearSpan(
  tile: Pick<FranchiseTile, "first_year" | "latest_year">,
): string | null {
  const { first_year: from, latest_year: to } = tile;
  if (from == null && to == null) return null;
  if (from == null || to == null || from === to) return String(from ?? to);
  return `${from}–${to}`;
}

// The Progress bar's fill, 0-100; a Franchise with no Mainline is empty.
export function progressPercent(progress: {
  done: number;
  total: number;
}): number {
  return progress.total > 0
    ? Math.round((progress.done / progress.total) * 100)
    : 0;
}
