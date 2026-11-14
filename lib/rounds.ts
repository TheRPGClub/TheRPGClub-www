import type { RoundEntryEdit } from "@/app/actions/rounds";
import type { Game, GotmEntry, GotmRound, Nomination, NrGotmEntry, VotingCategory } from "@/lib/api/types";

// Pure helpers behind the rounds and nominations admin pages
// (/admin/rounds, /admin/nominations).

export const TRACK_NAME: Record<VotingCategory, string> = {
  gotm: "GOTM",
  nr_gotm: "NR-GOTM",
};

// Both tracks, GOTM first.
export const TRACKS: readonly VotingCategory[] = ["gotm", "nr_gotm"];

// The two tracks in URL form, for /admin/rounds/<track>/<round>.
export const TRACK_SLUG: Record<VotingCategory, string> = {
  gotm: "gotm",
  nr_gotm: "nr-gotm",
};

export function trackFromSlug(slug: string | undefined): VotingCategory | null {
  if (slug === "gotm") return "gotm";
  if (slug === "nr-gotm") return "nr_gotm";
  return null;
}

export function roundEditHref(category: VotingCategory, round: number): string {
  return `/admin/rounds/${TRACK_SLUG[category]}/${round}`;
}

// The add form, prefilled for one track's round: `?track=nr-gotm&round=143&month=November 2026`.
export function roundPrefillHref(category: VotingCategory, round: number, monthYear: string): string {
  const ps = new URLSearchParams({ track: TRACK_SLUG[category], round: String(round), month: monthYear });
  return `/admin/rounds?${ps}#add`;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// "November 2026" -> "December 2026"; "December 2026" -> "January 2027".
// The archive's month_year is free text, so anything else comes back null.
export function nextMonthYear(monthYear: string | null | undefined): string | null {
  const match = /^\s*([A-Za-z]+)\s+(\d{4})\s*$/.exec(monthYear ?? "");
  if (!match) return null;
  const index = MONTHS.findIndex((m) => m.toLowerCase() === match[1].toLowerCase());
  if (index < 0) return null;
  const year = Number(match[2]);
  return index === 11 ? `${MONTHS[0]} ${year + 1}` : `${MONTHS[index + 1]} ${year}`;
}

// The month a date falls in, as the archive spells it ("November 2026").
export function monthYearOf(date: Date): string {
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export interface RoundDefaults {
  roundNumber: number;
  monthYear: string;
}

// What the add form starts on for a track: the round after that track's
// newest round, in the month after it. `rounds` is the newest-first page
// of /gotm_rounds.
export function nextRoundDefaults(
  rounds: readonly GotmRound[],
  category: VotingCategory,
  now: Date,
): RoundDefaults {
  const latest = rounds.find((r) => r[category] !== null);
  if (!latest) return { roundNumber: 1, monthYear: monthYearOf(now) };
  return {
    roundNumber: latest.round_number + 1,
    monthYear: nextMonthYear(latest[category]?.month_year) ?? monthYearOf(now),
  };
}

// The list with the item at `from` moved to `to` (both clamped).
export function moveItem<T>(list: readonly T[], from: number, to: number): T[] {
  const next = [...list];
  if (from < 0 || from >= next.length) return next;
  const target = Math.max(0, Math.min(next.length - 1, to));
  const [item] = next.splice(from, 1);
  next.splice(target, 0, item);
  return next;
}

// A Reddit URL as it is saved: trimmed, blank as null. Anything that isn't
// an http(s) URL is refused with a reason.
export function normalizeRedditUrl(raw: string): { url: string | null; error?: string } {
  const url = raw.trim();
  if (url === "") return { url: null };
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return { url: null, error: "The Reddit link must start with https://." };
    }
  } catch {
    return { url: null, error: "That Reddit link isn't a web address." };
  }
  return { url };
}

// The reason an Admin gives for deleting someone else's nomination: the
// bot's modal limit, which the API enforces too.
export const REMOVAL_REASON_MAX = 250;

// A round entry's id, whichever track's table it is in.
export function roundEntryId(entry: GotmEntry | NrGotmEntry): number {
  return "gotm_id" in entry ? entry.gotm_id : entry.nr_gotm_id;
}

// The games a round would hold more than once, each with the slot
// positions holding it (in slot order). The editor checks the whole round
// as it would be saved, so a swap (A takes B's game, B takes A's) passes
// while a slot left holding a game another slot took does not.
export function duplicateGames(gameIds: readonly (number | null)[]): Map<number, number[]> {
  const at = new Map<number, number[]>();
  gameIds.forEach((id, i) => {
    if (id === null) return;
    at.set(id, [...(at.get(id) ?? []), i]);
  });
  return new Map([...at].filter(([, slots]) => slots.length > 1));
}

// One slot of a track's round in the editor: its entry, the game it holds
// (null until a game is picked when the API answered without it) and its
// Reddit URL as typed.
export interface RoundSlot {
  id: number;
  index: number;
  game: Game | null;
  gameId: number | null;
  reddit: string;
}

export function roundSlotOf(entry: GotmEntry | NrGotmEntry): RoundSlot {
  return {
    id: roundEntryId(entry),
    index: entry.game_index,
    game: entry.game ?? null,
    gameId: entry.gamedb_game_id,
    reddit: entry.reddit_url ?? "",
  };
}

// What changed in a slot since it was saved, as the PATCH body wants it.
export function roundEntryEdit(slot: RoundSlot, saved: RoundSlot): RoundEntryEdit | null {
  const edit: RoundEntryEdit = { id: slot.id };
  if (slot.gameId !== saved.gameId && slot.gameId !== null) edit.gamedb_game_id = slot.gameId;
  if (slot.reddit.trim() !== saved.reddit.trim()) edit.reddit_url = slot.reddit;
  return Object.keys(edit).length > 1 ? edit : null;
}

// Co-winners read A, B, C as on the GOTM history.
export const SLOT_TAG = "ABCDEFGHIJ";

export function slotName(i: number, count: number): string {
  return count > 1 ? `Game ${SLOT_TAG[i] ?? i + 1}` : "Game";
}

// "A", "A and B", "A, B and C".
export function listNames(names: readonly string[]): string {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

// The editor's message when a save is refused partway: the API's error, the
// slots that saved and the ones that didn't (by slot name, over `slotIds` in
// slot order), and whether the round below was reloaded from the server
// (`reloaded` undefined when the API didn't say).
export function roundSaveFailure({
  slotIds,
  triedIds,
  savedIds,
  error,
  reloaded,
}: {
  slotIds: readonly number[];
  triedIds: readonly number[];
  savedIds: readonly number[];
  error?: string;
  reloaded: boolean | undefined;
}): string {
  const saved = new Set(savedIds);
  const tried = new Set(triedIds);
  const names = (pick: (id: number) => boolean) =>
    listNames(slotIds.flatMap((id, i) => (pick(id) ? [slotName(i, slotIds.length)] : [])));
  const savedNames = names((id) => saved.has(id));
  const unsavedNames = names((id) => tried.has(id) && !saved.has(id));
  const outcome = savedNames
    ? `Saved ${savedNames}; ${unsavedNames} not saved.`
    : triedIds.length > 1
      ? "Nothing was saved."
      : "";
  const reload =
    reloaded === undefined
      ? ""
      : reloaded
        ? " The round below is reloaded from the server."
        : " Refresh the page to see what the server holds.";
  return [error ?? "Couldn't save the round.", outcome].filter(Boolean).join(" ") + reload;
}

// Who nominated it: their display name, else their username, else the id.
export function nominatorName(n: Nomination): string {
  return n.user?.global_name || n.user?.username || n.user_id;
}
