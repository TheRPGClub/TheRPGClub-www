import type { GotyAward, GotyAwardKey, GotyVote, GotyVoteSummary } from "./types";
import { DAY_MS, HOUR_MS, etDateTime, etDayYear, etShort } from "./dates";

// What /goty shows for a GOTY Vote, worked out from the API's phase and
// Award objects (spec api#471, design pick C "Awards Night"). Pure, so the
// page and its tests share it.

// The page's stage: one body per phase. `closed` is the gap between a
// window closing and the sweep's tally; `tie` waits on an admin.
export type GotyStage = "upcoming" | "nominating" | "voting" | "counting" | "runoff" | "decided";

export function pageStage(vote: GotyVoteSummary): GotyStage {
  switch (vote.phase) {
    case "upcoming":
    case "nominating":
    case "voting":
    case "decided":
      return vote.phase;
    case "runoff":
    case "tie":
      return "runoff";
    case "closed":
      return vote.runoff_opens_at ? "runoff" : "counting";
  }
}

// How one Award stands right now.
export type AwardState =
  | "ballot" // open for votes
  | "uncontested" // one candidate: it wins at close, nothing to vote on
  | "empty" // no candidates: not given this year
  | "counting" // voting closed, tally pending
  | "runoff" // in its runoff, open for votes
  | "tie" // tied (runoff pending, closed or tied again): an admin decides
  | "won"; // has its winner

export function awardState(vote: GotyVote, award: GotyAward): AwardState {
  if (award.winner) return "won";
  const frozen = !!vote.candidates_frozen_at || vote.phase !== "voting";
  if (frozen && award.ballot.length === 0) return "empty";
  if (award.ballot.length === 1) return "uncontested";
  if (vote.phase === "voting") return "ballot";
  if (award.runoff_ballot.length > 0 && vote.runoff_open) return "runoff";
  if (award.pending_tie.length > 0 || award.runoff_ballot.length > 0) return "tie";
  if (vote.phase === "decided") return "empty";
  return "counting";
}

export interface GotyClock {
  figure: string;
  label: string;
  detail: string;
}

function left(ms: number, unit: number): number {
  return Math.max(0, Math.ceil(ms / unit));
}

// The banner's clock: a big figure, what it counts and when that ends.
export function gotyClock(vote: GotyVoteSummary, now: number): GotyClock {
  const at = (iso: string) => new Date(iso).getTime() - now;
  switch (pageStage(vote)) {
    case "upcoming": {
      const d = left(at(vote.nominations_open_at), DAY_MS);
      return { figure: String(d), label: `${d === 1 ? "Day" : "Days"} until nominations open`, detail: etDateTime(vote.nominations_open_at) };
    }
    case "nominating": {
      const d = left(at(vote.voting_opens_at), DAY_MS);
      return { figure: String(d), label: `${d === 1 ? "Day" : "Days"} of nominations left`, detail: `Voting opens ${etDateTime(vote.voting_opens_at)}` };
    }
    case "voting": {
      const d = left(at(vote.voting_closes_at), DAY_MS);
      return { figure: String(d), label: `${d === 1 ? "Day" : "Days"} of voting left`, detail: `Closes ${etDateTime(vote.voting_closes_at)}` };
    }
    case "counting":
      return { figure: "0", label: "Voting closed", detail: "Counting the votes. The results land here shortly." };
    case "runoff": {
      if (vote.runoff_open && vote.runoff_closes_at) {
        const h = left(at(vote.runoff_closes_at), HOUR_MS);
        return { figure: String(h), label: `${h === 1 ? "Hour" : "Hours"} of runoff left`, detail: `Closes ${etDateTime(vote.runoff_closes_at)}` };
      }
      return { figure: "0", label: "Runoff closed", detail: "A tie is left for an admin to settle." };
    }
    case "decided":
      return { figure: "", label: `Decided ${etDayYear(vote.decided_at ?? vote.voting_closes_at)} · three Awards`, detail: "" };
  }
}

export interface TimelineTick {
  at: number; // percent along the line
  date: string;
  name: string;
  major: boolean;
}

// The schedule's steps, not to scale (January gets the room), and the
// "Now" marker placed between them by time. No reminder steps (owner pick).
const SLOTS = [0, 30, 66, 82, 96];

export function gotyTimeline(vote: GotyVoteSummary, now: number): { ticks: TimelineTick[]; now: number } {
  // The sweep sets the year up by 1 December; a schedule moved earlier
  // than that keeps a month before nominations open.
  const opens = new Date(vote.nominations_open_at).getTime();
  const setUp = new Date(Math.min(Date.UTC(vote.year, 11, 1, 5), opens - 31 * DAY_MS)).toISOString();
  const runoffAt = vote.runoff_closes_at ?? new Date(new Date(vote.voting_closes_at).getTime() + DAY_MS).toISOString();
  const steps: [string, string][] = [
    [setUp, "Set up"],
    [vote.nominations_open_at, "Nominations open"],
    [vote.voting_opens_at, "Voting opens"],
    [vote.voting_closes_at, "Voting closes"],
    [runoffAt, vote.runoff_opens_at ? "Runoff" : "Runoff, if tied"],
  ];
  const ticks = steps.map(([iso, name], i) => ({ at: SLOTS[i], date: etShort(iso), name, major: i < 3 }));
  if (vote.phase === "decided") return { ticks, now: 100 };
  const times = steps.map(([iso]) => new Date(iso).getTime());
  let pos = 0;
  for (let i = 0; i < times.length; i++) {
    if (now < times[i]) {
      const prev = i === 0 ? times[0] - DAY_MS : times[i - 1];
      const from = i === 0 ? 0 : SLOTS[i - 1];
      pos = from + ((SLOTS[i] - from) * (now - prev)) / Math.max(1, times[i] - prev);
      break;
    }
    pos = i === times.length - 1 ? 100 : SLOTS[i];
  }
  return { ticks, now: Math.max(0, Math.min(100, pos)) };
}

export const AWARD_ORDER: readonly GotyAwardKey[] = ["gotm", "nr_gotm", "game_of_the_year"];

// The Award after this one, for the ballot's "Next" step.
export function nextAward(key: GotyAwardKey): GotyAwardKey {
  return AWARD_ORDER[(AWARD_ORDER.indexOf(key) + 1) % AWARD_ORDER.length];
}
