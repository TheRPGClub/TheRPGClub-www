import type { GotyVote } from "@/lib/goty/types";
import { envelope } from "@/lib/goty/awards";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import { AwardEnvelopeTab } from "./award-envelope-tab";
import { YearSoFarPanel } from "./year-so-far-panel";

// Before nominations open: the Year So Far (api#482) in the three Award
// envelopes. GOTM and NR-GOTM of the Year hold the year's winners to date
// (their ballot to be); Game of the Year holds the year's releases members
// have played, which are not nominations. No vote controls anywhere. Opens
// on Game of the Year, the night's headline Award, as the vote does.
export function UpcomingStage({ vote }: { vote: GotyVote }) {
  return (
    <Tabs defaultValue="gotm" className="flex flex-col gap-5">
      <TabsList variant="envelope" aria-label="The year so far, by Award" activateOnFocus>
        {vote.awards.map((a) => (
          <AwardEnvelopeTab key={a.award} award={a} env={envelope(vote, a, 0, 0)} />
        ))}
      </TabsList>
      {vote.awards.map((a) => (
        <TabsContent data-slot="goty-award-panel" key={a.award} value={a.award} keepMounted className="text-base">
          <YearSoFarPanel vote={vote} award={a} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
