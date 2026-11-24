import type { MemberShelfKind } from "@/lib/api/member-shelf-entry";
import type {
  GameCollection,
  GameCompletion,
  UserBacklog,
  UserFavorite,
  UserNowPlaying,
} from "@/lib/api/types";
import { COMPLETION_NOTE_MAX } from "@/lib/completions";
import { parsePlaytime } from "@/lib/imports/completionator";
import { COMPLETION_TYPES, OWNERSHIP_TYPES } from "@/lib/member-shelf/entry-meta";
import {
  completionDateProblems,
  dayOf,
  nowPlayingDateProblems,
  type DateProblems,
  type IsoDay,
} from "./dates";

// What each list's form holds, filled from the entry it edits (or the
// defaults for a new one), and the payload it saves (spec api#451). Pure, so
// the game page and the list pages fill and send the same way.

// What the server actions send (app/actions/member-shelf.ts). It lives here
// so lib can build it.
export interface MemberShelfPayload {
  gamedb_game_id: number;
  platform_id?: number | null;
  note?: string | null;
  // Required for the "collection" list, validated as one of
  // Digital | Physical | Subscription | Other.
  ownership_type?: string | null;
  // Required for the "completed" list, validated as one of
  // Main Story | Main Story + Side Content | Completionist.
  completion_type?: string | null;
  // Game Completion days, YYYY-MM-DD. Started is optional.
  started_at?: string | null;
  completed_at?: string | null;
  final_playtime_hrs?: number | null;
  // Completion create only: also take the game off Now Playing.
  leave_now_playing?: boolean;
  // Now Playing update only: the day the member started playing.
  added_at?: string | null;
  is_shared?: boolean;
  sort_order?: number | null;
}

export type ShelfPayload = Partial<MemberShelfPayload>;

// Stored hours ("38.0") as the Hours field holds them ("38").
function playtimeText(value: string | number | null): string {
  const hours = value === null || value === "" ? NaN : Number(value);
  return Number.isFinite(hours) ? String(Number(hours.toFixed(2))) : "";
}

const noteOrNull = (note: string) => (note.trim() ? note.trim() : null);

/* ---------- Game Completion ---------- */

export interface CompletionValues {
  completionType: string;
  started: IsoDay | null;
  finished: IsoDay | null;
  platformId: number | null;
  playtime: string;
  note: string;
  keepNowPlaying: boolean;
}

export interface CompletionStart {
  values: CompletionValues;
  // Where Started came from, for the "From Now Playing" line.
  startedFromNowPlaying: boolean;
}

// A new Game Completion finishes today; when the game is on the member's Now
// Playing, Started is the day they started it and the platform theirs. An
// existing one opens as it is stored.
export function completionStart(input: {
  entry?: GameCompletion | null;
  nowPlaying?: UserNowPlaying | null;
  today: IsoDay;
}): CompletionStart {
  const { entry, nowPlaying, today } = input;
  if (entry) {
    return {
      startedFromNowPlaying: false,
      values: {
        completionType: entry.completion_type || COMPLETION_TYPES[0],
        started: dayOf(entry.started_at),
        finished: dayOf(entry.completed_at),
        platformId: entry.platform_id,
        playtime: playtimeText(entry.final_playtime_hrs),
        note: entry.note ?? "",
        keepNowPlaying: false,
      },
    };
  }
  const started = dayOf(nowPlaying?.added_at);
  return {
    startedFromNowPlaying: started !== null,
    values: {
      completionType: COMPLETION_TYPES[0],
      started,
      finished: today,
      platformId: nowPlaying?.platform_id ?? null,
      playtime: "",
      note: "",
      keepNowPlaying: false,
    },
  };
}

export interface CompletionProblems extends DateProblems {
  playtime?: string;
  note?: string;
}

export function completionProblems(values: CompletionValues, today: IsoDay): CompletionProblems {
  const problems: CompletionProblems = completionDateProblems(values.started, values.finished, today);
  if (!parsePlaytime(values.playtime).ok) problems.playtime = "Hours must be a number, 0 or more.";
  if (values.note.length > COMPLETION_NOTE_MAX)
    problems.note = `Keep the note to ${COMPLETION_NOTE_MAX} characters.`;
  return problems;
}

// The completion's payload. Logging one while the game is on Now Playing
// takes it off unless "Keep it in Now Playing" is ticked; an edit never does.
// An edit sends a day only when it changed, so a stored day is never
// rewritten (or re-checked) by an edit that didn't touch it.
export function completionPayload(
  gameId: number,
  values: CompletionValues,
  context: { original: GameCompletion | null; onNowPlaying: boolean },
): ShelfPayload {
  const playtime = parsePlaytime(values.playtime);
  const { original } = context;
  const payload: ShelfPayload = {
    completion_type: values.completionType,
    platform_id: values.platformId,
    final_playtime_hrs: playtime.ok ? playtime.value : null,
    note: noteOrNull(values.note),
  };
  if (!original || values.started !== dayOf(original.started_at)) payload.started_at = values.started;
  if (!original || values.finished !== dayOf(original.completed_at)) payload.completed_at = values.finished;
  if (original) return payload;
  return {
    gamedb_game_id: gameId,
    ...payload,
    ...(context.onNowPlaying && !values.keepNowPlaying ? { leave_now_playing: true } : {}),
  };
}

/* ---------- Now Playing, Backlog, Favorites, Collection ---------- */

export type SimpleShelfKind = Exclude<MemberShelfKind, "completed">;
export type SimpleShelfEntry = UserNowPlaying | UserBacklog | UserFavorite | GameCollection;

export interface ShelfValues {
  platformId: number | null;
  note: string;
  ownershipType: string;
  // Now Playing only: the day the member started playing (`added_at`).
  started: IsoDay | null;
}

export function shelfStart(entry: SimpleShelfEntry | null | undefined, today: IsoDay): ShelfValues {
  return {
    platformId: entry?.platform_id ?? null,
    note: entry?.note ?? "",
    ownershipType:
      entry && "ownership_type" in entry && entry.ownership_type ? entry.ownership_type : OWNERSHIP_TYPES[0],
    started: entry && "added_at" in entry ? dayOf(entry.added_at) : today,
  };
}

export function shelfProblems(kind: SimpleShelfKind, values: ShelfValues, today: IsoDay): DateProblems {
  return kind === "now_playing" ? nowPlayingDateProblems(values.started, today) : {};
}

// A list entry's payload. Favorites have no platform; Collection carries how
// it is owned; Now Playing sends its Started day only when editing (the API
// stamps a new entry with today) and only when it changed.
export function shelfPayload(
  kind: SimpleShelfKind,
  gameId: number,
  values: ShelfValues,
  original?: SimpleShelfEntry | null,
): ShelfPayload {
  const payload: ShelfPayload = { note: noteOrNull(values.note) };
  if (!original) payload.gamedb_game_id = gameId;
  if (kind !== "favorite") payload.platform_id = values.platformId;
  if (kind === "collection") payload.ownership_type = values.ownershipType;
  if (kind === "now_playing" && original && "added_at" in original) {
    if (values.started && values.started !== dayOf(original.added_at)) payload.added_at = values.started;
  }
  return payload;
}

/* ---------- API refusals ---------- */

export interface ShelfRefusal {
  field?: "started" | "finished";
  message: string;
}

const REFUSALS: Record<string, ShelfRefusal> = {
  started_after_finished: { field: "started", message: "Started can't be after Finished." },
  finished_in_future: { field: "finished", message: "Finished can't be in the future." },
  started_in_future: { field: "started", message: "Started can't be in the future." },
  added_in_future: { field: "started", message: "Started can't be in the future." },
  already_playing: { message: "This game is already on your Now Playing list." },
};

// A refused save as the form shows it: on its field when it belongs to one.
export function shelfRefusal(code: string | undefined, fallback: string): ShelfRefusal {
  return (code && REFUSALS[code]) || { message: fallback };
}
