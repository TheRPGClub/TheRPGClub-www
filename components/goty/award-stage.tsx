"use client";

import { useState, type CSSProperties } from "react";
import type { NominatedGame } from "@/lib/goty/awards";
import { AWARD_INK, envelope, ownVoteCount } from "@/lib/goty/awards";
import type { GotyAwardKey, GotyVote } from "@/lib/goty/types";
import { awardState, nextAward } from "@/lib/goty/view";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
          return (
            <TabsTrigger
              key={a.award}
              value={a.award}
              style={{ "--tab-ink": AWARD_INK[a.award] } as CSSProperties}
              className="grid h-auto grid-cols-1 content-start items-start justify-items-start gap-1.5 px-2 py-2.5 text-left whitespace-normal sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-x-3 sm:gap-y-1.5 sm:px-4 sm:py-3.5"
            >
              <span className="font-headline text-base leading-[0.9] sm:text-2xl">{a.name}</span>
              {env.figure && (
                <span className="font-headline text-[1.7rem] leading-[0.8] sm:col-start-2 sm:row-span-2 sm:row-start-1 sm:self-center sm:text-[2.6rem]">
                  {env.figure}
                  {env.of && <span className="opacity-55">{env.of}</span>}
                </span>
              )}
              <span className="font-label text-[0.7rem] font-extrabold tracking-[0.08em] uppercase sm:text-[0.82rem]">
                {env.status}
              </span>
            </TabsTrigger>
          );
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
