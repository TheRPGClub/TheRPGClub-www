import type { ReactNode } from "react";
import type { GotyPageData } from "@/lib/goty/load";
import { nominatedGames } from "@/lib/goty/awards";
import { pageStage } from "@/lib/goty/view";
import { PageHeader } from "@/components/templates/page-header";
import { GotyBanner } from "./goty-banner";
import { GotyHistory } from "./goty-history";
import { UpcomingStage } from "./upcoming-stage";
import { HowItWorks } from "./how-it-works";
import { NominatingStage } from "./nominating-stage";
import { AwardStage } from "./award-stage";
import { DecidedStage } from "./decided-stage";

// /goty, design pick C "Awards Night" (www#191): a ceremony, one Award at a
// time. A banner over the year's winner covers carries the clock and the
// schedule; under it the stage for the phase (the three Awards, the
// nominations, the Award envelopes and their ballots, the runoff face-off,
// a cover story per decided Award, or before nominations the Year So Far
// and how it works); then every decided year.
export function GotyPage({
  data,
  viewerId,
  badge,
}: {
  data: GotyPageData;
  viewerId: string | undefined;
  badge: ReactNode;
}) {
  const { current, history, now } = data;
  if (!current) {
    return (
      <div className="space-y-8">
        <PageHeader title="GOTY Vote" badge={badge} />
        <p className="rounded-md border border-dashed border-border-strong px-4 py-12 text-center text-dim-foreground">
          No GOTY Vote yet. Each year&apos;s GOTY Vote starts on 1 January.
        </p>
        <GotyHistory years={history} />
      </div>
    );
  }

  const nominated = nominatedGames(data.nominations, viewerId);
  const stage = pageStage(current);
  return (
    <div className="flex flex-col gap-6.5 md:gap-9">
      <GotyBanner vote={current} now={now} badge={badge} />
      {stage === "upcoming" && <UpcomingStage vote={current} />}
      {stage === "upcoming" && <HowItWorks vote={current} />}
      {stage === "nominating" && (
        <NominatingStage vote={current} nominations={data.nominations} nominated={nominated} viewerId={viewerId} />
      )}
      {(stage === "voting" || stage === "counting" || stage === "runoff") && (
        <AwardStage vote={current} nominated={nominated} viewerId={viewerId} />
      )}
      {stage === "decided" && <DecidedStage vote={current} />}
      <GotyHistory years={history} />
    </div>
  );
}
