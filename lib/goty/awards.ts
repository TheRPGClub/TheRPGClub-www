import type { GameSummary, UserSummary } from "@/lib/api/types";
import type { GotyAward, GotyAwardKey, GotyAwardResult, GotyDecidedBy, GotyNomination, GotyVote, GotyWonIn } from "./types";
import { etShort } from "./dates";
import { awardState, pageStage } from "./view";

// Per-Award copy and numbers for /goty: the envelope's figure and status,
// the result rows, who nominated what. Pure, shared by the page and tests.

export interface Envelope {
  // The big figure ("4", "2/6"); empty for none.
  figure: string;
  // The part of the figure set faint ("/6").
  of?: string;
  status: string;
}

// A nomination's game, or a stand-in when the API sent none (a game since
// removed from GameDB), so the nomination still shows and can be withdrawn.
export function nominationGame(n: GotyNomination): GameSummary {
  return n.game ?? { game_id: n.gamedb_game_id, title: `Game #${n.gamedb_game_id}`, cover_url: null };
}

export function gameTitle(award: GotyAward, id: number): string {
  return award.ballot.find((g) => g.game_id === id)?.title ?? award.winner?.game?.title ?? "A game";
}

// How many votes the envelope counts as the viewer's: the ballot's own
// (optimistic) list once it has reported one, else the API's, from the
// runoff while the Award has one.
export function ownVoteCount(award: GotyAward, local?: readonly number[]): number {
  if (local) return local.length;
  return award.runoff_ballot.length ? award.own_runoff_votes.length : award.own_votes.length;
}

export function envelope(vote: GotyVote, award: GotyAward, nominatedGames: number, ownVotes: number): Envelope {
  const goty = award.award === "game_of_the_year";
  const stage = pageStage(vote);
  if (stage === "upcoming") {
    return goty
      ? { figure: "3", status: `nominations each, from ${etShort(vote.nominations_open_at)}` }
      : { figure: String(award.ballot.length), status: "games on the ballot" };
  }
  if (stage === "nominating") {
    return goty
      ? { figure: String(nominatedGames), status: "games nominated so far" }
      : { figure: String(award.ballot.length), status: "games, no nominating" };
  }
  const state = awardState(vote, award);
  switch (state) {
    case "won":
      return { figure: "", status: `${stage === "decided" ? "Won by" : "Decided:"} ${gameTitle(award, award.winner!.gamedb_game_id)}` };
    case "empty":
      return { figure: "0", status: "Not given this year" };
    case "uncontested":
      return { figure: "1", status: "game · uncontested" };
    case "ballot":
      return { figure: String(ownVotes), of: `/${award.cap}`, status: "your votes" };
    case "runoff":
      if (!vote.runoff_open) return { figure: "", status: "Counting the runoff" };
      return { figure: String(ownVotes), of: "/1", status: "runoff vote" };
    case "tie":
      return { figure: String(award.pending_tie.length || award.runoff_ballot.length), status: "tied · an admin decides" };
    case "counting":
      return { figure: "", status: "Counting the votes" };
  }
}

export interface ResultRow {
  game: GameSummary;
  votes: number;
  runoffVotes: number;
  voters: UserSummary[];
}

// An Award's candidates by votes, most first: the full result once the
// year is decided, else the open tally (empty while counts are hidden).
export function resultRows(award: GotyAward): ResultRow[] {
  const source = award.result ?? award.tally.games ?? [];
  const games = new Map(award.ballot.map((g) => [g.game_id, g]));
  return source
    .flatMap((row) => {
      const game = games.get(row.gamedb_game_id);
      if (!game) return [];
      const voters = (row as GotyAwardResult).voters ?? [];
      return [{ game, votes: row.votes, runoffVotes: row.runoff_votes, voters }];
    })
    .sort((a, b) => b.runoffVotes - a.runoffVotes || b.votes - a.votes);
}

export function votesFor(award: GotyAward, id: number, runoff = false): number | null {
  const row = (award.result ?? award.tally.games ?? []).find((r) => r.gamedb_game_id === id);
  if (!row) return null;
  return runoff ? row.runoff_votes : row.votes;
}

const DECIDED: Record<GotyDecidedBy, string> = {
  vote: "won by vote",
  runoff: "won in a runoff",
  admin: "tie settled by an admin",
  uncontested: "uncontested",
};

// "14 votes · won by vote", "9 votes · won in a runoff, 9 to 7".
export function decidedLine(award: GotyAward): string {
  const w = award.winner;
  if (!w) return "Not given";
  if (w.decided_by === "uncontested") return "Uncontested";
  const runoff = w.decided_by === "runoff";
  const rows = resultRows(award);
  const mine = votesFor(award, w.gamedb_game_id, runoff);
  let how = DECIDED[w.decided_by];
  if (runoff && rows.length > 1) {
    const other = rows.find((r) => r.game.game_id !== w.gamedb_game_id);
    if (other && mine != null) how += `, ${mine} to ${other.runoffVotes}`;
  }
  return mine == null ? how[0].toUpperCase() + how.slice(1) : `${mine} ${mine === 1 ? "vote" : "votes"} · ${how}`;
}

export interface NominatedGame {
  game: GameSummary;
  by: UserSummary[];
  mine: boolean;
  ownNominationId: number | null;
}

// Every nominated game once, with who nominated it; most nominations first,
// then the order first nominated.
export function nominatedGames(noms: GotyNomination[], viewerId?: string): NominatedGame[] {
  const byGame = new Map<number, NominatedGame>();
  for (const n of noms) {
    if (!n.game) continue;
    const entry = byGame.get(n.gamedb_game_id) ?? { game: n.game, by: [], mine: false, ownNominationId: null };
    if (n.user) entry.by.push(n.user);
    if (viewerId && n.user_id === viewerId) {
      entry.mine = true;
      entry.ownNominationId = n.id;
    }
    byGame.set(n.gamedb_game_id, entry);
  }
  return [...byGame.values()].sort((a, b) => b.by.length - a.by.length);
}

export function memberName(user: UserSummary | null | undefined): string {
  return user?.global_name ?? user?.username ?? "A member";
}

// "Nominated by you, Tavi" for a Game of the Year candidate.
export function nominatedBy(game: NominatedGame | undefined, viewerId?: string): string {
  if (!game?.by.length) return "";
  const names = game.by.filter((u) => u.user_id !== viewerId).map(memberName);
  if (game.mine) names.unshift("you");
  return `Nominated by ${names.join(", ")}`;
}

export const AWARD_INK: Record<GotyAwardKey, string> = {
  gotm: "var(--color-gotm)",
  nr_gotm: "var(--color-nr)",
  game_of_the_year: "var(--color-foreground)",
};

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

// A round's month from its raw label: "January 2026", "Jan 2026" or
// "2026-01". Anything else comes back null.
function roundMonth(monthYear: string): string | null {
  const numeric = /^\s*\d{4}-(\d{1,2})\s*$/.exec(monthYear);
  if (numeric) return MONTHS[Number(numeric[1]) - 1] ?? null;
  const word = /^\s*([A-Za-z]{3,})\.?\s+\d{4}\s*$/.exec(monthYear)?.[1].toLowerCase();
  return (word && MONTHS.find((m) => m.toLowerCase().startsWith(word.slice(0, 3)))) || null;
}

// Where a GOTM / NR-GOTM of the Year candidate won, as the ballot labels
// it: "Round 50 · January", or "Rounds 51 + 59 · Feb, Oct" for two wins.
// Empty when the game carries no win (Game of the Year candidates).
export function wonInLabel(wonIn: readonly GotyWonIn[] | undefined): string {
  if (!wonIn?.length) return "";
  const rounds = `${wonIn.length === 1 ? "Round" : "Rounds"} ${wonIn.map((w) => w.round_number).join(" + ")}`;
  const months = wonIn
    .map((w) => {
      const month = roundMonth(w.month_year);
      if (!month) return w.month_year.trim();
      return wonIn.length === 1 ? month : month.slice(0, 3);
    })
    .filter(Boolean);
  return months.length ? `${rounds} · ${months.join(", ")}` : rounds;
}

// The label for a game on an Award's ballot, joined by id (the winner,
// result and tally carry no won_in of their own).
export function wonInFor(award: GotyAward, gameId: number): string {
  return wonInLabel(award.ballot.find((g) => g.game_id === gameId)?.won_in);
}
