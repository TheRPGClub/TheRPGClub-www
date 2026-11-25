import type { GotyAward, GotyAwardKey, GotyNomination, GotyPhase, GotyVote, GotyVoteSummary } from "@/lib/api/goty";
import { DAY_MS } from "@/lib/voting-console";

// Pure helpers behind /admin/goty, the GOTY Vote desk (www#194). The API
// decides every action (api#474: PATCH dates, resolve_tie; api#473: a staff
// removal with a reason); these pick the year, word its state and keep the
// forms honest before a request goes out.

export const GOTY_AWARD_SHORT: Record<GotyAwardKey, string> = {
  gotm: "GOTM of the Year",
  nr_gotm: "NR-GOTM of the Year",
  game_of_the_year: "Game of the Year",
};

export const GOTY_PHASE_WORDS: Record<GotyPhase, string> = {
  upcoming: "Upcoming",
  nominating: "Nominations open",
  voting: "Voting open",
  closed: "Voting closed",
  runoff: "Runoff open",
  tie: "Tie break",
  decided: "Decided",
};

// The year the desk opens on: `?year=` when the API has it, else the newest
// GOTY Vote not yet decided, else the newest. Null when there is none.
export function pickGotyYear(votes: readonly GotyVoteSummary[], asked?: string | null): number | null {
  const wanted = Number(asked);
  if (asked && votes.some((v) => v.year === wanted)) return wanted;
  const newestFirst = [...votes].sort((a, b) => b.year - a.year);
  return (newestFirst.find((v) => v.phase !== "decided") ?? newestFirst[0])?.year ?? null;
}

function inDays(ms: number): string {
  const days = Math.max(0, Math.ceil(ms / DAY_MS));
  if (days === 0) return "today";
  return days === 1 ? "in 1 day" : `in ${days} days`;
}

// "GOTY Vote 2026 · Nominations open · 12 nominations · voting opens in 9 days".
export function gotyStatusLine(vote: GotyVoteSummary, nominations: number, now: number): string {
  const parts = [vote.name, GOTY_PHASE_WORDS[vote.phase]];
  if (vote.phase === "upcoming") parts.push(`nominations open ${inDays(Date.parse(vote.nominations_open_at) - now)}`);
  if (vote.phase === "nominating" || vote.phase === "upcoming") {
    if (vote.phase === "nominating") parts.push(`${nominations} ${nominations === 1 ? "nomination" : "nominations"}`);
    parts.push(`voting opens ${inDays(Date.parse(vote.voting_opens_at) - now)}`);
  } else if (vote.phase === "voting") {
    parts.push(`closes ${inDays(Date.parse(vote.voting_closes_at) - now)}`);
  } else if (vote.phase === "runoff" && vote.runoff_closes_at) {
    parts.push(`runoff closes ${inDays(Date.parse(vote.runoff_closes_at) - now)}`);
  }
  return parts.join(" · ");
}

export type GotyDateKey = "nominations_open_at" | "voting_opens_at" | "voting_closes_at";

export const GOTY_DATE_KEYS: readonly GotyDateKey[] = ["nominations_open_at", "voting_opens_at", "voting_closes_at"];

export const GOTY_DATE_LABEL: Record<GotyDateKey, string> = {
  nominations_open_at: "Nominations open",
  voting_opens_at: "Voting opens",
  voting_closes_at: "Voting closes",
};

// Which dates may still move, as the API rules them (api#474): nothing once
// decided; once voting has opened only the close, and only while the main
// vote is still open; before that all three.
export function movableDates(vote: GotyVoteSummary, now: number): ReadonlySet<GotyDateKey> {
  if (vote.decided_at || vote.phase === "decided") return new Set();
  if (now >= Date.parse(vote.voting_opens_at)) {
    return vote.phase === "voting" ? new Set(["voting_closes_at"]) : new Set();
  }
  return new Set(GOTY_DATE_KEYS);
}

// Why the dates can't move at all, for the card's note; null when some can.
export function datesLockedReason(vote: GotyVoteSummary, now: number): string | null {
  if (movableDates(vote, now).size > 0) return null;
  if (vote.decided_at || vote.phase === "decided") return `${vote.name} is decided, so its dates are history.`;
  return `Voting for ${vote.name} has closed, so its dates can't move.`;
}

export type GotyDates = Record<GotyDateKey, number>;

export function savedDates(vote: GotyVoteSummary): GotyDates {
  return {
    nominations_open_at: Date.parse(vote.nominations_open_at),
    voting_opens_at: Date.parse(vote.voting_opens_at),
    voting_closes_at: Date.parse(vote.voting_closes_at),
  };
}

// The dates the draft changes, for the PATCH. Moving the vote's opening
// without its close lets the API keep the default weekend window.
export function changedDates(saved: GotyDates, draft: GotyDates): Partial<GotyDates> {
  const out: Partial<GotyDates> = {};
  for (const key of GOTY_DATE_KEYS) if (draft[key] !== saved[key]) out[key] = draft[key];
  return out;
}

// Why the draft can't be saved, or null. The order the API validates
// (nominations open < voting opens < voting closes) is checked only between
// dates the draft sets: an unchanged close follows a moved opening.
export function datesRefusal(saved: GotyDates, draft: GotyDates): string | null {
  const changed = changedDates(saved, draft);
  const keys = Object.keys(changed) as GotyDateKey[];
  if (keys.length === 0) return "Nothing to save: no date has changed.";
  if (keys.some((k) => Number.isNaN(draft[k]))) return "Pick a date and time for each field.";
  const closeFollows = changed.voting_opens_at !== undefined && changed.voting_closes_at === undefined;
  if (draft.nominations_open_at >= draft.voting_opens_at) return "Nominations must open before voting opens.";
  if (!closeFollows && draft.voting_opens_at >= draft.voting_closes_at) return "Voting must open before it closes.";
  return null;
}

// The Awards still tied once voting (and any runoff) is over, as the bot's
// tie prompt shows them: phase `tie` and games pending.
export function tiedAwards(vote: GotyVote): GotyAward[] {
  if (vote.phase !== "tie") return [];
  return vote.awards.filter((a) => a.pending_tie.length > 0);
}

// The tied games with their titles and the last count staff can read (the
// runoff's when there was one).
export function tieChoices(award: GotyAward): { gameId: number; title: string; votes: number | null }[] {
  const titles = new Map(award.ballot.map((g) => [g.game_id, g.title]));
  const counts = new Map((award.tally.games ?? []).map((g) => [g.gamedb_game_id, g]));
  const runoff = award.runoff_ballot.length > 0;
  return award.pending_tie.map((gameId) => {
    const row = counts.get(gameId);
    const votes = row ? (runoff ? row.runoff_votes : row.votes) : null;
    return { gameId, title: titles.get(gameId) ?? `Game ${gameId}`, votes };
  });
}

// Staff remove nominations until voting opens (api#473).
export function nominationsRemovable(vote: GotyVoteSummary, now: number): boolean {
  return now < Date.parse(vote.voting_opens_at);
}

// Who nominated it: their display name, else their username, else the id.
export function gotyNominatorName(n: GotyNomination): string {
  return n.user?.global_name || n.user?.username || n.user_id;
}
