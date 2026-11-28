import { X } from "lucide-react";
import type { ChallengePage } from "@/lib/challenges/challenge-page";
import { memberAvatar, memberName } from "@/lib/challenges/runs";
import { runDates, runMatrix, runStamp, yourSlotsRun } from "@/lib/challenges/slots";
import type { ChallengeRun } from "@/lib/challenges/types";
import { cn } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { DeleteRunButton } from "@/components/challenges/delete-run-button";
import { RunNoticeSlot } from "@/components/challenges/run-notice";
import { PanelActions } from "@/components/challenges/slots/panel-actions";
import { RunLegend } from "@/components/challenges/slots/run-legend";
import { RunMatrix } from "@/components/challenges/slots/run-matrix";
import { RunPanelHeader } from "@/components/challenges/slots/run-panel-header";
import { SlotActionsProvider } from "@/components/challenges/slots/slot-actions";
import { StartPanel } from "@/components/challenges/slots/start-panel";

// The Run panel (surface brief challenges-slots, 3A): your Run as the decade
// matrix with your actions, or, when a lane below is tapped (`?run=<member>`),
// that member's Run in the same matrix, read-only, with Back to your Run.
// Without a Run it shows the years you'd fill and Start a Run. Refusals show
// in the notice slip at its top.
export function RunPanel({
  page,
  viewerId,
  memberId,
  runAction,
}: {
  page: ChallengePage;
  viewerId: string;
  memberId: string | null;
  runAction: React.ReactNode;
}) {
  const runs = page.slotRuns ?? [];
  const member = memberId && memberId !== viewerId ? yourSlotsRun(runs, memberId) : null;
  const run = member ?? yourSlotsRun(runs, viewerId);
  return (
    <section
      id="run"
      data-slot="run-panel"
      aria-label={member ? `${memberName(member.user)}'s Run` : "Your Run"}
      className="mt-[26px] scroll-mt-24 rounded-md bg-card px-3.5 pt-5 pb-5 sm:px-[22px] sm:pb-[22px]"
    >
      <RunNoticeSlot className="mb-4 max-w-lg" />
      {run ? (
        <RunBody page={page} run={run} member={!!member} runAction={runAction} />
      ) : (
        <StartPanel page={page} runAction={runAction} />
      )}
    </section>
  );
}

function RunBody({
  page,
  run,
  member,
  runAction,
}: {
  page: ChallengePage;
  run: ChallengeRun;
  member: boolean;
  runAction: React.ReactNode;
}) {
  const matrix = runMatrix(run, page.today);
  const name = memberName(run.user);
  const active = run.status === "active";
  const own = !member && active;
  const ended = run.status === "abandoned" || run.status === "expired";
  const actions = member ? (
    <ButtonLink href={`/challenges/${page.challenge.id}#run`} variant="outline" size="sm">
      <X aria-hidden /> Back to your Run
    </ButtonLink>
  ) : own ? (
    <PanelActions canMove={matrix.movable.length > 0} hasOpenYear={matrix.openYears.length > 0} />
  ) : (
    <>
      <DeleteRunButton runId={run.id} className="self-center" />
      {runAction}
    </>
  );
  return (
    <SlotActionsProvider
      runId={run.id}
      matrix={matrix}
      own={own}
      pastPlay={page.challenge.slots?.counts_past_play ?? false}
      owner={name}
    >
      <RunPanelHeader
        title={member ? `${name}'s Run` : `Your Run · from ${run.slots?.first_year ?? "…"}`}
        note={member ? runDates(run, page.today) : undefined}
        member={member ? { name, avatarUrl: memberAvatar(run.user), userId: run.user.user_id } : undefined}
        score={{ cleared: matrix.cleared, target: matrix.target }}
        line={own ? matrix.line : undefined}
        stamp={runStamp(run)}
        actions={actions}
      />
      <div className={cn(ended && "opacity-75")}>
        <RunMatrix rows={matrix.rows} label={member ? `${name}'s years` : "Your years"} />
      </div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <RunLegend matrix={matrix} owner={member ? name : null} />
        {own && <div className="mt-4 ml-auto">{runAction}</div>}
      </div>
    </SlotActionsProvider>
  );
}
