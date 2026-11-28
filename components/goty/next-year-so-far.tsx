import type { GotyVote } from "@/lib/goty/types";
import { SectionHeading } from "@/components/templates/page-header";
import { UpcomingStage } from "./upcoming-stage";

// Under a decided vote's results (they stay up for 30 days): next year's
// GOTY Vote so far, in the same three Award envelopes the Upcoming stage
// uses. Its banner and how it works wait until it is the Current GOTY Vote.
export function NextYearSoFar({ vote }: { vote: GotyVote }) {
  return (
    <section data-slot="goty-stage" data-variant="next-year" aria-labelledby="goty-next" className="mt-2.5 flex flex-col gap-4">
      <SectionHeading title={<span id="goty-next">{vote.year} so far</span>} count={vote.name} className="mb-1" />
      <UpcomingStage vote={vote} />
    </section>
  );
}
