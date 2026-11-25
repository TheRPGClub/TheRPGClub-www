"use client";

import type { NominatedGame } from "@/lib/goty/awards";
import type { GotyAward, GotyVote } from "@/lib/goty/types";
import { awardState } from "@/lib/goty/view";
import { AwardBallot } from "./award-ballot";
import { AwardStory } from "./award-story";
import { RunoffFaceOff } from "./runoff-face-off";
import { UncontestedAward } from "./uncontested-award";

// One Award's ballot under its envelope, by how the Award stands: open for
// votes, counting, uncontested, not given, in its runoff (or tied for an
// admin), or already won (its cover story, compact).
export function AwardPanel({
  vote,
  award,
  nominated,
  viewerId,
  onNext,
  nextName,
}: {
  vote: GotyVote;
  award: GotyAward;
  nominated: NominatedGame[];
  viewerId: string | undefined;
  onNext: () => void;
  nextName: string;
}) {
  const state = awardState(vote, award);
  switch (state) {
    case "won":
      return <AwardStory vote={vote} award={award} compact />;
    case "uncontested":
      return <UncontestedAward vote={vote} award={award} />;
    case "empty":
      return (
        <p className="rounded-md border border-dashed border-border-strong px-4 py-12 text-center text-dim-foreground">
          {award.name} is not given this year: {vote.phase === "decided" ? "nobody voted" : "it has no candidates"}.
        </p>
      );
    case "runoff":
    case "tie":
      return <RunoffFaceOff vote={vote} award={award} open={state === "runoff"} />;
    case "ballot":
    case "counting":
      return (
        <AwardBallot
          vote={vote}
          award={award}
          nominated={nominated}
          viewerId={viewerId}
          open={state === "ballot"}
          onNext={onNext}
          nextName={nextName}
        />
      );
  }
}
