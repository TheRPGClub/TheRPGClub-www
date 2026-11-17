import { calendarError, SECRET_SANTA_CALENDAR } from "@/lib/challenges/edition-calendar";
import type { Challenge, ChallengeFormat, ChallengeSchedule, PoolSource } from "@/lib/challenges/types";

// The create and edit form (surface brief challenges-form) as plain data: the
// draft the form edits, its checks, and the request bodies the API takes
// (`POST /api/v1/challenges`, `PATCH /api/v1/challenges/:id`). This ticket
// covers the Pool and the schedule; Slots (www#109) and Assignment (www#110)
// add their settings here. Client-safe and pure.

export interface DraftGame {
  game_id: number;
  title: string;
  cover_url?: string | null;
}

// A franchise or collection the Pool is built from. `game_count` is known
// when it was picked from the search, not when read back from the Challenge.
export type DraftSource = Pick<PoolSource, "kind" | "id" | "name"> & {
  game_count?: number;
};

export interface ChallengeDraft {
  format: ChallengeFormat;
  name: string;
  description: string;
  hostedByClub: boolean;
  schedule: ChallengeSchedule;
  // MM-DD, repeating every year (Seasonal only).
  seasonStart: string;
  seasonEnd: string;
  // YYYY-MM-DD or null for no end (Always Open only).
  endsOn: string | null;
  target: number | "all";
  sources: DraftSource[];
  included: DraftGame[];
  excluded: DraftGame[];
  // Assignment only: the Edition calendar as MM-DD (www#110).
  signupCutoff: string;
  pickDeadline: string;
  reveal: string;
}

export function emptyDraft(): ChallengeDraft {
  return {
    format: "pool",
    name: "",
    description: "",
    hostedByClub: false,
    schedule: "always_open",
    seasonStart: "09-22",
    seasonEnd: "12-20",
    endsOn: null,
    target: 3,
    sources: [],
    included: [],
    excluded: [],
    signupCutoff: SECRET_SANTA_CALENDAR.cutoff,
    pickDeadline: SECRET_SANTA_CALENDAR.deadline,
    reveal: SECRET_SANTA_CALENDAR.reveal,
  };
}

export function draftFromChallenge(challenge: Challenge): ChallengeDraft {
  const pool = challenge.pool;
  return {
    ...emptyDraft(),
    format: challenge.challenge_format,
    name: challenge.name,
    description: challenge.description ?? "",
    hostedByClub: challenge.hosted_by_club,
    schedule: challenge.schedule,
    seasonStart: challenge.season?.start ?? "09-22",
    seasonEnd: challenge.season?.end ?? "12-20",
    endsOn: challenge.ends_on ?? null,
    target: pool?.target ?? 3,
    sources: [
      ...(pool?.franchises ?? []).map((f) => ({
        kind: "franchise" as const,
        id: f.franchise_id,
        name: f.name,
      })),
      ...(pool?.collections ?? []).map((c) => ({
        kind: "collection" as const,
        id: c.collection_id,
        name: c.name,
      })),
    ],
    included: (pool?.included_games ?? []).map((g) => ({
      game_id: g.game_id,
      title: g.title,
    })),
    excluded: (pool?.excluded_games ?? []).map((g) => ({
      game_id: g.game_id,
      title: g.title,
    })),
    signupCutoff: challenge.assignment?.signup_cutoff ?? SECRET_SANTA_CALENDAR.cutoff,
    pickDeadline: challenge.assignment?.pick_deadline ?? SECRET_SANTA_CALENDAR.deadline,
    reveal: challenge.assignment?.reveal ?? SECRET_SANTA_CALENDAR.reveal,
  };
}

export interface PoolDefinition {
  franchise_ids: number[];
  collection_ids: number[];
  included_game_ids: number[];
  excluded_game_ids: number[];
}

// The Pool as the API reads it. The form previews it without the games left
// out (`withExcluded: false`), so a left-out cover stays on the wall to put
// back.
export function poolDefinition(draft: ChallengeDraft, { withExcluded = true } = {}): PoolDefinition {
  const ids = (kind: DraftSource["kind"]) => draft.sources.filter((s) => s.kind === kind).map((s) => s.id);
  return {
    franchise_ids: ids("franchise"),
    collection_ids: ids("collection"),
    included_game_ids: draft.included.map((g) => g.game_id),
    excluded_game_ids: withExcluded ? draft.excluded.map((g) => g.game_id) : [],
  };
}

export function hasPoolDefinition(draft: ChallengeDraft): boolean {
  return draft.sources.length > 0 || draft.included.length > 0;
}

export type DraftErrors = Partial<Record<"name" | "target" | "sources" | "season" | "endsOn" | "calendar", string>>;

const MONTH_DAY = /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const DAY = /^\d{4}-\d{2}-\d{2}$/;

// What stops the draft from saving, by the sentence word it belongs to.
// `poolSize` is the previewed Pool's game count, when known.
export function validateDraft(draft: ChallengeDraft, poolSize: number | null): DraftErrors {
  const errors: DraftErrors = {};
  const name = draft.name.trim();
  if (!name) errors.name = "Give the Challenge a name.";
  else if (name.length > 100) errors.name = "Keep the name to 100 characters.";
  if (draft.format === "pool") {
    if (!hasPoolDefinition(draft)) errors.sources = "Add a franchise, a collection or a game.";
    if (draft.target !== "all") {
      if (!Number.isInteger(draft.target) || draft.target < 1) errors.target = "Clear at least 1 game.";
      else if (poolSize !== null && draft.target > poolSize) errors.target = `The Pool has only ${poolSize} games.`;
    }
  }
  if (draft.format === "assignment") {
    // Always Open with no end date: the Editions set its time.
    const calendar = calendarError(assignmentCalendar(draft));
    if (calendar) errors.calendar = calendar;
    return errors;
  }
  if (draft.schedule === "seasonal") {
    if (!MONTH_DAY.test(draft.seasonStart) || !MONTH_DAY.test(draft.seasonEnd))
      errors.season = "Pick the Season's days.";
    else if (draft.seasonStart === draft.seasonEnd) errors.season = "A Season ends on another day than it starts.";
  } else if (draft.endsOn !== null && !DAY.test(draft.endsOn)) {
    errors.endsOn = "Pick an end date.";
  }
  return errors;
}

type RequestData = {
  name: string;
  description: string;
  challenge_format?: ChallengeFormat;
  schedule?: ChallengeSchedule;
  season?: { start: string; end: string } | null;
  ends_on?: string | null;
  hosted_by_club?: boolean;
  pool?: PoolDefinition & { target: number | "all" };
  assignment?: { signup_cutoff: string; pick_deadline: string; reveal: string };
};

function assignmentCalendar(draft: ChallengeDraft) {
  return { cutoff: draft.signupCutoff, deadline: draft.pickDeadline, reveal: draft.reveal };
}

function ruleFields(draft: ChallengeDraft): RequestData {
  if (draft.format === "assignment") {
    // An Assignment Challenge runs in Editions: Always Open, no end date.
    return {
      name: draft.name.trim(),
      description: draft.description.trim(),
      challenge_format: draft.format,
      schedule: "always_open",
      season: null,
      ends_on: null,
      assignment: {
        signup_cutoff: draft.signupCutoff,
        pick_deadline: draft.pickDeadline,
        reveal: draft.reveal,
      },
    };
  }
  const seasonal = draft.schedule === "seasonal";
  return {
    name: draft.name.trim(),
    description: draft.description.trim(),
    challenge_format: draft.format,
    schedule: draft.schedule,
    season: seasonal ? { start: draft.seasonStart, end: draft.seasonEnd } : null,
    ends_on: seasonal ? null : draft.endsOn,
    ...(draft.format === "pool" ? { pool: { ...poolDefinition(draft), target: draft.target } } : {}),
  };
}

export function createRequest(draft: ChallengeDraft): { data: RequestData } {
  const { pool, ...rest } = ruleFields(draft);
  return {
    data: {
      ...rest,
      hosted_by_club: draft.hostedByClub,
      ...(pool ? { pool } : {}),
    },
  };
}

// An edit. Once the rules are locked (a Run exists) or the Format's rules
// aren't edited here, only the name, description and an Always Open end date
// go, and the end date not once the Challenge is Closed for good. The Host is
// changed by staff on the Challenge page, never here.
export function editRequest(
  draft: ChallengeDraft,
  { locked, closedForGood }: { locked: boolean; closedForGood: boolean },
): { data: RequestData } {
  if (!locked) return { data: ruleFields(draft) };
  const data: RequestData = {
    name: draft.name.trim(),
    description: draft.description.trim(),
  };
  if (draft.schedule === "always_open" && !closedForGood) data.ends_on = draft.endsOn;
  return { data };
}

// Tapping a cover on the Pool wall: a game added by hand comes out of the
// Pool; a source's game is left out, or put back.
export function toggleGame(draft: ChallengeDraft, game: DraftGame): ChallengeDraft {
  if (draft.included.some((g) => g.game_id === game.game_id)) {
    return {
      ...draft,
      included: draft.included.filter((g) => g.game_id !== game.game_id),
    };
  }
  const out = draft.excluded.some((g) => g.game_id === game.game_id);
  return {
    ...draft,
    excluded: out ? draft.excluded.filter((g) => g.game_id !== game.game_id) : [...draft.excluded, game],
  };
}

export function includeGame(draft: ChallengeDraft, game: DraftGame): ChallengeDraft {
  const excluded = draft.excluded.filter((g) => g.game_id !== game.game_id);
  if (draft.included.some((g) => g.game_id === game.game_id)) return { ...draft, excluded };
  return { ...draft, excluded, included: [...draft.included, game] };
}

export function addSource(draft: ChallengeDraft, source: DraftSource): ChallengeDraft {
  if (draft.sources.some((s) => s.kind === source.kind && s.id === source.id)) return draft;
  return { ...draft, sources: [...draft.sources, source] };
}

export function removeSource(draft: ChallengeDraft, source: DraftSource): ChallengeDraft {
  return {
    ...draft,
    sources: draft.sources.filter((s) => !(s.kind === source.kind && s.id === source.id)),
  };
}
