import { calendarError, SECRET_SANTA_CALENDAR } from "@/lib/challenges/edition-calendar";
import { clubToday } from "@/lib/challenges/dates";
import { slotsDraftFrom, slotsErrors, slotsRequest, SLOTS_DEFAULTS, type SlotsDraft } from "@/lib/challenges/slots-form";
import { goalErrors } from "@/lib/challenges/pool-editor";
import type {
  Challenge,
  ChallengeFormat,
  ChallengeOptionalGame,
  ChallengeSchedule,
  ChallengeSlots,
  PoolSource,
} from "@/lib/challenges/types";

// The create and edit form (surface brief challenges-form) as plain data: the
// draft the form edits, its checks, and the request bodies the API takes
// (`POST /api/v1/challenges`, `PATCH /api/v1/challenges/:id`): the Pool and
// the schedule, and the Slots range (./slots-form, www#109). Client-safe and
// pure.

export interface DraftGame {
  game_id: number;
  title: string;
  cover_url?: string | null;
}

// A Franchise or Series (the API's collection) the Pool is built from. `game_count` is known
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
  // Pool (spec api#442): every Core Game plus this many Optional Games.
  optionalTarget: number;
  sources: DraftSource[];
  core: DraftGame[];
  // Optional Games picked by hand (sources bring the rest).
  optional: DraftGame[];
  excluded: DraftGame[];
  // The saved Pool's Optional Games, for their "new" tags and the linked
  // Game List's games, which the preview can't resolve (empty on create).
  savedOptional: ChallengeOptionalGame[];
  gameList: { id: number; name: string } | null;
  // Assignment only: the Edition calendar as MM-DD (www#110).
  signupCutoff: string;
  pickDeadline: string;
  reveal: string;
  // Slots: the range and Counts past play.
  slots: SlotsDraft;
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
    optionalTarget: 0,
    sources: [],
    core: [],
    optional: [],
    excluded: [],
    savedOptional: [],
    gameList: null,
    signupCutoff: SECRET_SANTA_CALENDAR.cutoff,
    pickDeadline: SECRET_SANTA_CALENDAR.deadline,
    reveal: SECRET_SANTA_CALENDAR.reveal,
    slots: { ...SLOTS_DEFAULTS },
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
    optionalTarget: pool?.optional_target ?? 0,
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
    core: (pool?.core_games ?? []).map((g) => ({ game_id: g.game_id, title: g.title, cover_url: g.cover_url ?? null })),
    optional: (pool?.optional_games ?? [])
      .filter((g) => g.source === "hand")
      .map((g) => ({ game_id: g.game_id, title: g.title, cover_url: g.cover_url ?? null })),
    excluded: (pool?.excluded_games ?? []).map((g) => ({
      game_id: g.game_id,
      title: g.title,
    })),
    savedOptional: pool?.optional_games ?? [],
    gameList: pool?.game_list ? { id: pool.game_list.id, name: pool.game_list.name } : null,
    signupCutoff: challenge.assignment?.signup_cutoff ?? SECRET_SANTA_CALENDAR.cutoff,
    pickDeadline: challenge.assignment?.pick_deadline ?? SECRET_SANTA_CALENDAR.deadline,
    reveal: challenge.assignment?.reveal ?? SECRET_SANTA_CALENDAR.reveal,
    slots: slotsDraftFrom(challenge.slots),
  };
}

export interface PoolDefinition {
  franchise_ids: number[];
  collection_ids: number[];
  core_game_ids: number[];
  optional_game_ids: number[];
  excluded_game_ids: number[];
}

// The Pool as the API takes it.
export function poolDefinition(draft: ChallengeDraft): PoolDefinition {
  const ids = (kind: DraftSource["kind"]) => draft.sources.filter((s) => s.kind === kind).map((s) => s.id);
  return {
    franchise_ids: ids("franchise"),
    collection_ids: ids("collection"),
    core_game_ids: draft.core.map((g) => g.game_id),
    optional_game_ids: draft.optional.map((g) => g.game_id),
    excluded_game_ids: draft.excluded.map((g) => g.game_id),
  };
}

// What the editor previews: the sources and the hand-picked Optional Games
// only, so a source's game that is Core or Left out still shows (the editor
// then knows a source brings it) and is sorted out by ./pool-editor.
export function sourcePreviewDefinition(draft: ChallengeDraft): PoolDefinition {
  return { ...poolDefinition(draft), core_game_ids: [], excluded_game_ids: [] };
}

export function hasSourcePreview(draft: ChallengeDraft): boolean {
  return draft.sources.length > 0 || draft.optional.length > 0;
}

export type DraftErrors = Partial<
  Record<"name" | "target" | "sources" | "season" | "endsOn" | "slotsFirst" | "slotsLast" | "calendar", string>
>;

const MONTH_DAY = /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const DAY = /^\d{4}-\d{2}-\d{2}$/;

// What stops the draft from saving, by the sentence word it belongs to.
// `optionalCount` is the Pool's Optional Games now, when known.
export function validateDraft(
  draft: ChallengeDraft,
  optionalCount: number | null,
  currentYear: number = Number(clubToday().slice(0, 4)),
): DraftErrors {
  const errors: DraftErrors = {};
  const name = draft.name.trim();
  if (!name) errors.name = "Give the Challenge a name.";
  else if (name.length > 100) errors.name = "Keep the name to 100 characters.";
  if (draft.format === "pool") {
    const goal = goalErrors(draft, optionalCount);
    if (goal.empty) errors.sources = goal.empty;
    if (goal.target) errors.target = goal.target;
  }
  if (draft.format === "assignment") {
    // Always Open with no end date: the Editions set its time.
    const calendar = calendarError(assignmentCalendar(draft));
    if (calendar) errors.calendar = calendar;
    return errors;
  }
  if (draft.format === "slots") Object.assign(errors, slotsErrors(draft.slots, currentYear));
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
  pool?: PoolDefinition & { optional_target: number };
  assignment?: { signup_cutoff: string; pick_deadline: string; reveal: string };
  slots?: ChallengeSlots;
};

function poolRequest(draft: ChallengeDraft) {
  return { ...poolDefinition(draft), optional_target: draft.optionalTarget };
}

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
    ...(draft.format === "pool" ? { pool: poolRequest(draft) } : {}),
    ...(draft.format === "slots" ? { slots: slotsRequest(draft.slots, draft.schedule) } : {}),
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
// go, and the end date not once the Challenge is Closed for good; a Pool
// stays editable with Runs (spec api#442), so it goes too. The Host is
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
  if (draft.format === "pool") data.pool = poolRequest(draft);
  return { data };
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
