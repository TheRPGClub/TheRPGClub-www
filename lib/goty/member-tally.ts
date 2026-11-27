import type { GotyAward, GotyVote } from "./types";

// The Current GOTY Vote as /goty may show it: the members' rule for every
// viewer. The API hands staff the live counts (the admin desk reads them),
// so the public page drops them here, before they reach the page, rather
// than only hiding them on screen. As the API does for members: no counts
// until voting has ended, and no runoff counts while the runoff is open.
const VOTING_ENDED = new Set<GotyVote["phase"]>(["closed", "runoff", "tie", "decided"]);

export function memberTally(vote: GotyVote): GotyVote {
  const hidden = !VOTING_ENDED.has(vote.phase);
  const runoffHidden = hidden || vote.phase === "runoff";
  if (!runoffHidden) return vote;
  return { ...vote, awards: vote.awards?.map((award) => hideCounts(award, hidden)) };
}

function hideCounts(award: GotyAward, hidden: boolean): GotyAward {
  const games = hidden ? [] : (award.tally.games ?? []).map((g) => ({ ...g, runoff_votes: 0 }));
  return {
    ...award,
    tally: { counts_hidden: hidden || award.tally.counts_hidden, runoff_counts_hidden: true, games },
    result: hidden ? null : award.result,
  };
}
