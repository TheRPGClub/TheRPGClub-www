import { listBotJobsAction } from "@/app/actions/bot-jobs";
import { apiFetch } from "@/lib/api";
import type { VotingCategory, VotingRound } from "@/lib/api/types";
import {
  fetchNominations,
  fetchTally,
  fetchVotingRound,
  VOTING_CATEGORIES,
} from "@/lib/api/voting-round";
import { requireAuth } from "@/lib/session";
import { canUseTier, staffSection } from "@/lib/staff";
import { hasRunoff, tallyLines, totalVotes } from "@/lib/voting-console";
import { DeskHeader } from "@/components/admin/desk/desk-header";
import { StaffOnly } from "@/components/staff-only";
import { VotingConsole, type ConsoleTrack } from "@/components/admin/voting/voting-console";

const SECTION = staffSection("voting");

// The round before, for when its nominations opened (it was decided then).
async function fetchRound(number: number): Promise<VotingRound | null> {
  if (number <= 0) return null;
  try {
    const res = await apiFetch(`/api/v1/voting_rounds/${number}`, { cache: "no-store" });
    if (!res.ok) return null;
    return ((await res.json()) as { data: VotingRound }).data;
  } catch {
    return null;
  }
}

async function loadTrack(round: VotingRound, category: VotingCategory): Promise<ConsoleTrack> {
  const n = round.round_number;
  const runoff = hasRunoff(round, category);
  const [nominations, main, runoffTally] = await Promise.all([
    fetchNominations(category, n),
    fetchTally(category, n),
    runoff ? fetchTally(category, n, { runoff: true }) : null,
  ]);
  const lines = tallyLines(nominations, main.rows);
  return {
    category,
    lines,
    total: totalVotes(lines),
    readable: main.ok && !main.countsHidden,
    runoff:
      runoff && runoffTally
        ? {
            lines: tallyLines(nominations, runoffTally.rows, round.runoff_ties?.[category] ?? []),
            readable: runoffTally.ok && !runoffTally.countsHidden,
          }
        : null,
    tied: round.pending_ties[category] ?? [],
  };
}

// Everything the console reads, stamped with the moment it was read so the
// ruler's "Today" and the countdowns agree.
async function loadConsole(round: VotingRound) {
  const [previous, tracks, wire] = await Promise.all([
    fetchRound(round.round_number - 1),
    Promise.all(VOTING_CATEGORIES.map((c) => loadTrack(round, c))),
    listBotJobsAction(1),
  ]);
  return { previous, tracks, wire, now: Date.now() };
}

// /admin/voting, the voting console: the round as a press check. Its
// numeral and a date ruler with the Next vote pin lead; below sit the
// private GOTM and NR-GOTM tallies with their resets, and the round's
// operations (close now, publish results, repost panels, next vote).
export default async function VotingConsolePage() {
  const session = await requireAuth();
  if (!canUseTier(session.membership, SECTION.tier)) {
    return <StaffOnly title={SECTION.label} tier={SECTION.tier} />;
  }

  const round = await fetchVotingRound();
  if (!round) {
    return (
      <div className="space-y-6">
        <DeskHeader title={SECTION.label} side={<>No round scheduled</>} />
        <p className="rounded-md border border-dashed border-rule-strong px-4 py-12 text-center text-paper-dim">
          No voting round is scheduled. Deciding a round schedules the next one.
        </p>
      </div>
    );
  }

  const { previous, tracks, wire, now } = await loadConsole(round);

  return (
    <VotingConsole
      round={round}
      nominationsOpenedAt={previous?.decided_at ?? null}
      tracks={tracks}
      jobs={wire.ok ? (wire.data ?? []) : []}
      now={now}
    />
  );
}
