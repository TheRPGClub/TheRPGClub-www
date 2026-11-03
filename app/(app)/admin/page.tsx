import { listBotJobsAction } from "@/app/actions/bot-jobs";
import { fetchSuggestions } from "@/lib/api/suggestions";
import type { VotingPhase, VotingRound } from "@/lib/api/types";
import { fetchVotingRound } from "@/lib/api/voting-round";
import { agoText, latestFailure } from "@/lib/bot-jobs";
import { requireAuth } from "@/lib/session";
import {
  canUseTier,
  isAdminOrAbove,
  isSuperadmin,
  staffDeskFor,
  staffSection,
  staffTierOf,
  TIER_NAME,
  type StaffSectionKey,
} from "@/lib/staff";
import { DeskContents, type DeskNote } from "@/components/admin/desk/desk-contents";
import { DeskHeader } from "@/components/admin/desk/desk-header";
import { Wire } from "@/components/admin/desk/wire";
import { StaffOnly } from "@/components/staff-only";

const PHASE_NOTE: Record<VotingPhase, string> = {
  nominating: "nominations",
  voting: "open",
  closed: "closed",
  tie: "tie break",
  decided: "decided",
};

function roundNote(round: VotingRound): DeskNote {
  return { text: `Round ${round.round_number} ${PHASE_NOTE[round.phase]}`, tone: "live" };
}

// /admin, the production desk: a contents page of the tools the viewer's
// tier can use, grouped by area, beside the wire of bot jobs.
export default async function StaffDeskPage() {
  const session = await requireAuth();
  const m = session.membership;
  const overview = staffSection("overview");
  const tier = staffTierOf(m);
  if (!tier || !canUseTier(m, overview.tier)) {
    return <StaffOnly title={overview.label} tier={overview.tier} />;
  }

  const areas = staffDeskFor(m);
  const toolCount = areas.reduce((n, a) => n + a.sections.length, 0);

  const [wire, round, pending] = await Promise.all([
    listBotJobsAction(1),
    isAdminOrAbove(m) ? fetchVotingRound() : null,
    isSuperadmin(m) ? fetchSuggestions(["pending"], 1) : null,
  ]);
  const jobs = wire.ok ? (wire.data ?? []) : [];

  const notes: Partial<Record<StaffSectionKey, DeskNote>> = {};
  if (round) notes.voting = roundNote(round);
  if (pending) notes.suggestions = { text: `${pending.total} pending` };
  const now = new Date();
  for (const area of areas) {
    for (const section of area.sections) {
      const failed = section.jobKinds && latestFailure(jobs, section.jobKinds);
      if (failed) {
        notes[section.key] = {
          text: `Failed ${agoText(failed.finished_at ?? failed.updated_at, now)}`,
          tone: "bad",
        };
      }
    }
  }

  const name = session.principal.global_name ?? session.principal.username;
  const reach =
    tier === "superadmin" ? " · Admins see all but Superadmin" : tier === "admin" ? " · All but Superadmin" : "";

  return (
    <div>
      <DeskHeader
        title={overview.label}
        side={
          <>
            <b>{name}</b> · {TIER_NAME[tier]}
            <br />
            {toolCount} {toolCount === 1 ? "tool" : "tools"}
            {reach}
          </>
        }
      />
      <div className="mt-6.5 grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_27rem] xl:gap-11">
        <DeskContents areas={areas} notes={notes} />
        <Wire
          initialJobs={jobs}
          initialMeta={wire.meta ?? null}
          initialError={wire.ok ? null : wire.error}
          scope={isAdminOrAbove(m) ? "all" : "mine"}
        />
      </div>
    </div>
  );
}
