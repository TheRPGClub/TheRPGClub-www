import type {
  Nomination,
  NominationVote,
  VoteTallyRow,
  VotingCategory,
  VotingRound,
} from "@/lib/api/types";
import { tallyByGame } from "@/lib/api/voting-round";

// How a track's vote came out, for the result slot on the voting strip.
export type TrackResult =
  // A tie the runoff or the admins are settling.
  | { kind: "tie"; titles: string[]; runoff: boolean }
  // No votes were cast (or nothing was on the ballot).
  | { kind: "none"; hadNominations: boolean }
  // The game(s) with the most votes, and how many that was.
  | { kind: "leaders"; titles: string[]; top: number };

// After the vote: the game(s) with the most votes, or the tie the admins are
// settling. A game nominated twice counts both nominations' votes.
export function trackResult(
  round: VotingRound,
  category: VotingCategory,
  nominations: Nomination[],
  rows: VoteTallyRow[],
): TrackResult {
  const tied = round.pending_ties[category] ?? [];
  if (tied.length > 0) {
    return {
      kind: "tie",
      titles: tied.map((game) => game.title),
      runoff: round.phase === "runoff",
    };
  }

  const byGame = tallyByGame(rows);
  const top = Math.max(0, ...byGame.values());
  if (top === 0) return { kind: "none", hadNominations: nominations.length > 0 };

  const titles = [...byGame.entries()]
    .filter(([, count]) => count === top)
    .map(
      ([gameId]) =>
        nominations.find((n) => n.gamedb_game_id === gameId)?.game?.title ??
        "Unknown game",
    );
  return { kind: "leaders", titles, top };
}

// The game a vote went to: the vote's own embed, else its nomination's.
export function voteTitle(vote: NominationVote, nominations: Nomination[]): string {
  return (
    vote.game?.title ??
    nominations.find((n) => n.nomination_id === vote.nomination_id)?.game?.title ??
    "Unknown game"
  );
}
