import type { ApiErrorBody } from "@/lib/api/errors";
import { daysBetween, formatDay, type IsoDay } from "@/lib/challenges/dates";
import { memberName } from "@/lib/challenges/runs";
import type { ChallengeEdition, SantaBacklogEntry, SantaTaste, SantaView } from "@/lib/challenges/types";

// The Santa pick page as plain data (surface brief challenges-santa-pick,
// 6C with 6A's name tag): the recipient's eligible backlog dealt one game at
// a time, how the deal moves, the copy around it, and how a refused pick or
// an unreachable page reads. Pure and client-safe.

// One dealt game: a backlog game once, whatever platforms it's on.
export interface PickCard {
  gameId: number;
  title: string;
  coverUrl: string | null;
  artUrl: string | null;
  year: number | null;
  platforms: string[];
  // HowLongToBeat's hours (null without).
  hours: number | null;
}

const platformName = (p: NonNullable<SantaBacklogEntry["platform"]>) => p.platform_abbreviation || p.platform_name;

export function pickCards(backlog: readonly SantaBacklogEntry[]): PickCard[] {
  const cards = new Map<number, PickCard>();
  for (const entry of backlog) {
    const game = entry.game;
    const card = cards.get(game.game_id) ?? {
      gameId: game.game_id,
      title: game.title,
      coverUrl: game.cover_url ?? null,
      artUrl: game.art_url ?? null,
      year: game.initial_release_date ? Number(game.initial_release_date.slice(0, 4)) : null,
      platforms: [],
      hours: entry.hours ?? null,
    };
    const platform = entry.platform && platformName(entry.platform);
    if (platform && !card.platforms.includes(platform)) card.platforms.push(platform);
    if (card.hours === null && entry.hours != null) card.hours = entry.hours;
    cards.set(game.game_id, card);
  }
  return [...cards.values()];
}

// HowLongToBeat's time as the card says it: "About 62 hours".
export function hoursLabel(hours: number | null | undefined): string | null {
  if (hours == null) return null;
  const whole = Math.round(hours);
  if (whole < 1) return "Under an hour";
  return `About ${whole} ${whole === 1 ? "hour" : "hours"}`;
}

// The next or previous game, wrapping round the backlog.
export function stepTo(current: number, count: number, by: 1 | -1): number {
  if (count <= 1) return 0;
  return (current + by + count) % count;
}

// Shuffle deals a random game other than the one showing.
export function shuffleTo(current: number, count: number, random: () => number = Math.random): number {
  if (count <= 1) return 0;
  const other = Math.min(Math.floor(random() * (count - 1)), count - 2);
  return other >= current ? other + 1 : other;
}

const LONG_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// "Tue 15 Dec".
function weekdayDay(day: IsoDay): string {
  const [y, m, d] = day.split("-").map(Number);
  return `${WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]} ${formatDay(day)}`;
}

// "25 December".
function longDay(day: IsoDay): string {
  const [, m, d] = day.split("-").map(Number);
  return `${d} ${LONG_MONTHS[m - 1]}`;
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

// The page's words around the deal: the header, the privacy line and the
// note under the reel (before and after a pick).
export function pickCopy(view: SantaView, today: IsoDay) {
  const name = memberName(view.recipient);
  const deadline = view.pick_deadline_on ?? today;
  const due = weekdayDay(deadline);
  const reveal = view.reveal_on ? longDay(view.reveal_on) : "the reveal";
  const days = Math.max(daysBetween(today, deadline), 0);
  return {
    name,
    title: `Pick for ${name}`,
    chip: [view.challenge?.name ?? "Secret Santa", view.year].filter(Boolean).join(" "),
    days,
    daysLabel: `${days === 1 ? "day" : "days"} · picks due ${due}`,
    privacy: `Only you can see this page. ${name} finds out on ${reveal}, and who picked stays secret until the Edition ends.`,
    note: (count: number, picked: boolean) =>
      picked
        ? `You can change your pick until picks close on ${due}. ${name} finds out on ${reveal}.`
        : `${plural(count, "game", "games")}: ${name}'s backlog, without the games they've Cleared. ` +
          `Shuffle deals a random one; the reel jumps anywhere. ` +
          `If you don't pick by ${due}, ${name} gets a random game from this list.`,
  };
}

const andList = (items: readonly string[]) =>
  items.length < 2 ? (items[0] ?? "") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;

// "Loot Hoarder plays most on PlayStation 5", "Their top genres: A, B and
// C": what the API knows of the recipient's taste (none of it may be known).
export function tasteHints(taste: SantaTaste | undefined, name: string): string[] {
  if (!taste) return [];
  const genres = taste.genres.map((g) => g.name);
  return [
    taste.platform && `${name} plays most on ${taste.platform.platform_name}`,
    genres.length > 0 && `Their top ${genres.length === 1 ? "genre" : "genres"}: ${andList(genres)}`,
  ].filter((hint): hint is string => typeof hint === "string");
}

// Used only when the API sends no message of its own.
const FALLBACK: Record<string, string> = {
  not_a_santa: "You aren't a Santa in this Edition.",
  picks_closed: "Picks have closed for this Edition, so your pick can't change now.",
  not_eligible: "That game has left their backlog or been Cleared. Pick another one.",
};

// How a refused pick (or Santa view) reads, from the response.
export function pickRefusal(err: ApiErrorBody): string {
  const { status } = err;
  if (status === 401) return "Your session has ended. Sign in again.";
  if (err.message) return err.message;
  if (err.code && Object.hasOwn(FALLBACK, err.code)) return FALLBACK[err.code];
  if (status === 404) return "This Edition no longer exists, or is hidden.";
  if (status === 403) return FALLBACK.not_a_santa;
  return "That didn't work. Try again in a moment.";
}

// The Santa view, or the API's refusal (status 0: unreachable).
export type SantaRead = { ok: true; view: SantaView } | { ok: false; error: ApiErrorBody };

export type PickPageState =
  | { kind: "open" }
  | { kind: "closed" | "empty" | "refused" | "unread"; title: string; message: string };

// What the pick page shows: the deal while picks are open; otherwise a slip
// (picks closed, nothing to pick, not this Edition's Santa, unreadable).
export function pickPageState(read: SantaRead): PickPageState {
  if (!read.ok) {
    if ([401, 403, 404].includes(read.error.status)) {
      return { kind: "refused", title: "Not your pick", message: pickRefusal(read.error) };
    }
    return { kind: "unread", title: "Not just now", message: "Your pick page couldn't be read. Try again in a moment." };
  }
  const { view } = read;
  const name = memberName(view.recipient);
  const reveal = view.reveal_on ? longDay(view.reveal_on) : "the reveal";
  if (!view.picks_open) {
    const pick = view.pick;
    const what = !pick
      ? `${name} gets a random game from their backlog`
      : pick.picked_randomly
        ? `${name} got ${pick.game.title} as a random pick`
        : `You picked ${pick.game.title} for ${name}`;
    const closed = view.pick_deadline_on ? `Picks closed on ${formatDay(view.pick_deadline_on)}.` : "Picks have closed.";
    const title = pick && !pick.picked_randomly ? "Your pick is in" : "Picks are closed";
    return { kind: "closed", title, message: `${closed} ${what}; everyone sees it on ${reveal}.` };
  }
  if ((view.backlog ?? []).length === 0) {
    return {
      kind: "empty",
      title: "Nothing to pick",
      message: `${name} has Cleared every game in their backlog, so there's nothing to pick. If that's still so when picks close, they get no game this year.`,
    };
  }
  return { kind: "open" };
}

// The Edition a pick page is about: the one asked for (`?edition=`), else
// the newest still in picking, else the newest (whose Santa view then says
// picks are closed, or that the viewer isn't a Santa).
export function santaEdition(
  editions: readonly ChallengeEdition[],
  requested: number | null,
): ChallengeEdition | null {
  return (
    editions.find((e) => e.id === requested) ?? editions.find((e) => e.phase === "picking") ?? editions[0] ?? null
  );
}

// The card's two-line headline (DESIGN.md, the Two-Line Headline Rule):
// broken at the subtitle colon, else before the last word, except that a
// last word of two letters or fewer ("XI S", "of P") keeps the word before
// it. The size steps down with the longest line so the headline stays on
// two lines in the card's column: xl up to 9 letters, lg up to 13, md up
// to 16, sm beyond.
export function pickTitle(title: string): { lines: [string, string]; size: "xl" | "lg" | "md" | "sm" } {
  const colon = title.indexOf(":");
  let lines: [string, string];
  if (colon > 0 && colon < title.length - 1) {
    lines = [title.slice(0, colon + 1), title.slice(colon + 1).trim()];
  } else {
    const words = title.split(" ");
    const cut = words.length > 2 && words.at(-1)!.length <= 2 ? words.length - 2 : words.length - 1;
    lines = [words.slice(0, cut).join(" "), words.slice(cut).join(" ")];
  }
  const longest = Math.max(...lines.map((line) => line.length));
  const size = longest <= 9 ? "xl" : longest <= 13 ? "lg" : longest <= 16 ? "md" : "sm";
  return { lines, size };
}
