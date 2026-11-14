import type { VotingPhase } from "@/lib/api/types";
import { fetchNominations, fetchVotingRound, VOTING_CATEGORIES } from "@/lib/api/voting-round";
import { requireAuth } from "@/lib/session";
import { canUseTier, staffSection } from "@/lib/staff";
import { DeskHeader } from "@/components/templates/desk-header";
import { NominationDesk } from "@/components/admin/nominations/nomination-desk";
import { StaffOnly } from "@/components/staff-only";

const SECTION = staffSection("nominations");

const PHASE_NOTE: Record<VotingPhase, string> = {
  nominating: "nominations open",
  voting: "voting open",
  closed: "voting closed",
  tie: "tie break",
  runoff: "runoff",
  decided: "decided",
};

// /admin/nominations: the current round's nominations by track. An Admin
// deletes one with a reason; the bot posts the change and the refreshed
// list in the nomination channel (no DM to the nominator).
export default async function NominationsAdminPage() {
  const session = await requireAuth();
  if (!canUseTier(session.membership, SECTION.tier)) {
    return <StaffOnly title={SECTION.label} tier={SECTION.tier} />;
  }

  const round = await fetchVotingRound();
  if (!round) {
    return (
      <div>
        <DeskHeader title={SECTION.label} side="No round right now" />
        <p className="mt-6 text-dim-foreground">There is no voting round, so there are no nominations to delete.</p>
      </div>
    );
  }

  const tracks = await Promise.all(
    VOTING_CATEGORIES.map(async (category) => ({
      category,
      nominations: await fetchNominations(category, round.round_number),
    })),
  );
  const [gotm, nr] = tracks.map((t) => t.nominations.length);

  return (
    <div>
      <DeskHeader
        title={SECTION.label}
        side={
          <>
            <b>Round {round.round_number}</b> · {PHASE_NOTE[round.phase]}
            <br />
            {gotm} GOTM · {nr} NR-GOTM · the bot posts each delete
          </>
        }
      />
      <NominationDesk
        round={round.round_number}
        tracks={tracks}
        viewerId={session.principal.id}
        viewerName={session.principal.global_name ?? session.principal.username}
        votesCast={round.phase !== "nominating"}
      />
    </div>
  );
}
