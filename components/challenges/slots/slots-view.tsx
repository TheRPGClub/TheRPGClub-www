import type { ChallengePage } from "@/lib/challenges/challenge-page";
import { runsTimeline } from "@/lib/challenges/slots-timeline";
import { tintStyle } from "@/lib/challenges/tint";
import { ChallengeBanner } from "@/components/challenges/challenge-banner";
import { ChallengeRules } from "@/components/challenges/challenge-rules";
import { RunNoticeProvider } from "@/components/challenges/run-notice";
import { RunPanel } from "@/components/challenges/slots/run-panel";
import { RunsTimeline } from "@/components/challenges/slots/runs-timeline";

// A Slots Challenge's page (surface brief challenges-slots, 3A + 3B): the
// banner with its slot-grid picture, the rules row, your Run as a decade
// matrix (or the member's whose lane was tapped, `?run=<member>`), and
// everyone else's Runs on one year axis.
export function SlotsView({
  page,
  viewerId,
  memberId,
  showAll,
  badge,
  tools,
  notice,
  runAction,
}: {
  page: ChallengePage;
  viewerId: string;
  memberId: string | null;
  showAll: boolean;
  badge?: React.ReactNode;
  tools?: React.ReactNode;
  notice?: React.ReactNode;
  // Start a Run, Abandon your Run or why not (www#107's button).
  runAction?: React.ReactNode;
}) {
  const { challenge } = page;
  const timeline = page.slotRuns ? runsTimeline(page.slotRuns, viewerId, page.today) : null;
  const selected = timeline?.lanes.some((lane) => lane.userId === memberId) ? memberId : null;
  return (
    <div style={tintStyle(page.tint)} className="pb-12">
      <ChallengeBanner page={page} badge={badge} />
      {notice}
      <ChallengeRules page={page} tools={tools} />
      <RunNoticeProvider>
        <RunPanel page={page} viewerId={viewerId} memberId={selected} runAction={runAction} />
      </RunNoticeProvider>
      <RunsTimeline
        challengeId={challenge.id}
        timeline={timeline}
        selected={selected}
        showAll={showAll}
        birthYear={challenge.slots?.first_year === "birth_year"}
      />
    </div>
  );
}
