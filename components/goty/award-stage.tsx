"use client";

import { useState } from "react";
import type { NominatedGame } from "@/lib/goty/awards";
import { envelope, ownVoteCount } from "@/lib/goty/awards";
import type { GotyAwardKey, GotyVote } from "@/lib/goty/types";
import { awardState, nextAward } from "@/lib/goty/view";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import { AwardEnvelopeTab } from "./award-envelope-tab";
import { AwardPanel } from "./award-panel";

// Voting, counting and the runoff: the three Award envelopes switch the
// ballot below, one Award at a time. Every panel stays mounted, so a vote
// cast on one keeps its state while the member looks at another.
export function AwardStage({
  vote,
  nominated,
  viewerId,
}: {
  vote: GotyVote;
  nominated: NominatedGame[];
  viewerId: string | undefined;
}) {
  const [award, setAward] = useState<GotyAwardKey>(() => openingAward(vote));
  // Each ballot's own votes as it reports them, so an envelope counts the
  // vote the moment it is cast, as the ballot below it does.
  const [local, setLocal] = useState<Partial<Record<GotyAwardKey, number[]>>>({});
  return (
    <Tabs value={award} onValueChange={(v) => setAward(v as GotyAwardKey)} className="flex flex-col gap-5">
      <TabsList variant="envelope" aria-label="Awards" activateOnFocus>
        {vote.awards.map((a) => {
          const env = envelope(vote, a, nominated.length, ownVoteCount(a, local[a.award]));
          return <AwardEnvelopeTab key={a.award} award={a} env={env} />;
        })}
      </TabsList>
      {vote.awards.map((a) => (
        <TabsContent key={a.award} value={a.award} keepMounted className="text-base">
          <AwardPanel
            vote={vote}
            award={a}
            nominated={nominated}
            viewerId={viewerId}
            onNext={() => setAward(nextAward(a.award))}
            nextName={vote.awards.find((x) => x.award === nextAward(a.award))?.name ?? ""}
            onVotes={(votes) => setLocal((l) => ({ ...l, [a.award]: votes }))}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}

// The Award the stage opens on: the first still being run in a runoff or
// tie, else Game of the Year, the night's headline Award.
function openingAward(vote: GotyVote): GotyAwardKey {
  const live = vote.awards.find((a) => {
    const s = awardState(vote, a);
    return s === "runoff" || s === "tie";
  });
  return live?.award ?? "game_of_the_year";
}
