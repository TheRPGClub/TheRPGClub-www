import type { Nomination, NominationVote, VotingCategory, VotingRound } from "@/lib/api/types";
import {
  ballotIsPublic,
  fetchNominations,
  fetchTally,
  fetchUserVotes,
  VOTING_CATEGORIES,
  type RoundTally,
} from "@/lib/api/voting-round";
import { ballotTally } from "@/lib/voting/tally";

// One track of the round as the voting page shows it.
export interface TrackData {
  category: VotingCategory;
  nominations: Nomination[];
  tally: RoundTally;
  userVotes: NominationVote[];
}

const NO_TALLY: RoundTally = { rows: [], cap: 0, countsHidden: false, ok: true };

// Both tracks' nominations, plus the tally and the viewer's own votes once the
// ballot is public, stamped with the time they were read so the clock counts
// down from the same moment.
export async function loadRound(
  round: VotingRound,
  viewerId: string | undefined,
): Promise<{ tracks: TrackData[]; now: number }> {
  const ballot = ballotIsPublic(round);
  const tracks = await Promise.all(
    VOTING_CATEGORIES.map(async (category) => {
      const [nominations, tally, userVotes] = await Promise.all([
        fetchNominations(category, round.round_number),
        ballot
          ? fetchTally(category, round.round_number).then((tally) => ballotTally(tally, round))
          : Promise.resolve(NO_TALLY),
        // Own votes are only readable (and only castable) while the window
        // is open; a finished round is just its tally.
        round.voting_open && viewerId
          ? fetchUserVotes(category, round.round_number, viewerId)
          : Promise.resolve([]),
      ]);
      return { category, nominations, tally, userVotes };
    }),
  );
  return { tracks, now: Date.now() };
}
