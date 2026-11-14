import { getSession } from "@/lib/session";
import type { VotingCategory, VotingRound } from "@/lib/api/types";
import type { GameBallotPanelProps } from "@/components/voting/game-ballot-panel";
import { accentForCategory } from "@/components/voting/accents";
import {
  ballotIsPublic,
  fetchNominations,
  fetchTally,
  fetchUserVotes,
  fetchVotingRound,
  tallyByGame,
  VOTING_CATEGORIES,
  VOTING_CATEGORY_TITLE,
} from "@/lib/api/voting-round";

// The game page's ballot strips: one per category whose current ballot holds
// the game, so a member who landed on the game from a link or a search can
// vote without finding its card on /voting. Empty before a round's vote
// opens: its ballot is withheld, and nothing here should leak what was
// nominated.
export async function gameBallotPanels(gameId: number): Promise<GameBallotPanelProps[]> {
  const round = await fetchVotingRound();
  if (!round || !ballotIsPublic(round)) return [];

  // getSession is React-cached, so this reuses the page's read.
  const session = await getSession();
  const panels = await Promise.all(
    VOTING_CATEGORIES.map((category) =>
      ballotPanel(category, gameId, round, session?.principal.id),
    ),
  );
  return panels.filter((panel) => panel !== null);
}

async function ballotPanel(
  category: VotingCategory,
  gameId: number,
  voting: VotingRound,
  userId: string | undefined,
): Promise<GameBallotPanelProps | null> {
  const round = voting.round_number;
  const nominations = await fetchNominations(category, round);
  // Two members can nominate the same game in one round, so this is a list.
  const forGame = nominations.filter((n) => n.gamedb_game_id === gameId);
  if (!forGame.length) return null;

  const [tally, userVotes] = await Promise.all([
    fetchTally(category, round),
    voting.voting_open && userId
      ? fetchUserVotes(category, round, userId)
      : Promise.resolve([]),
  ]);

  const byGame = tallyByGame(tally.rows);
  const count = byGame.get(gameId) ?? 0;
  const maxCount = Math.max(0, ...byGame.values());

  const votedOn = userVotes.find((vote) => vote.gamedb_game_id === gameId);
  const earliest = forGame.reduce((a, b) =>
    a.nominated_at <= b.nominated_at ? a : b,
  );

  return {
    category,
    categoryTitle: VOTING_CATEGORY_TITLE[category],
    accent: accentForCategory[category],
    round,
    nominationId: votedOn?.nomination_id ?? earliest.nomination_id,
    count,
    maxCount,
    countsHidden: tally.countsHidden,
    voted: votedOn !== undefined,
    votesUsed: userVotes.length,
    cap: tally.cap,
    votingOpen: voting.voting_open,
    // A shared lead is a tie for the admins to break, not a win yet.
    isWinner:
      voting.voting_ended &&
      voting.phase !== "tie" &&
      voting.phase !== "runoff" &&
      maxCount > 0 &&
      count === maxCount,
    nominatedBy: forGame.map(
      (n) => n.user?.global_name ?? n.user?.username ?? "Unknown member",
    ),
    signedIn: userId !== undefined,
  };
}
