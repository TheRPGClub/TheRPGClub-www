import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  fetchCurrentGotmRound,
  fetchGotmRounds,
} from "@/lib/api/gotm-rounds";
import { fetchNominations, fetchVotingRound } from "@/lib/api/voting-round";
import type { VotingRound } from "@/lib/api/types";
import { CoverStory } from "@/components/issue/cover-story";
import { NrFeature } from "@/components/issue/nr-feature";
import { PreviousRounds } from "@/components/issue/previous-rounds";
import {
  RoundPanel,
  type TrackedNomination,
} from "@/components/issue/round-panel";
import { headingLinkClass } from "@/components/issue/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { getSession } from "@/lib/session";
import { cn } from "@/lib/utils";

// The dashboard is the current issue: the round's GOTM as the cover story,
// its NR-GOTM as the feature beside it, the club's open business (nominations
// or the vote) in yellow under that, and the previous rounds below.
//
// A round missing one track gives its column away: with no NR-GOTM the
// nominations panel takes the whole right column; with no GOTM the NR-GOTM is
// promoted to the cover.

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

const PREVIOUS_ROUNDS = 3;

async function DashboardContent() {
  // Session first: every read below needs auth, so a logged-out render skips
  // them instead of wasting fetches that can only 401.
  const session = await getSession();
  if (!session) return null;

  const [round, history, voting] = await Promise.all([
    fetchCurrentGotmRound(),
    fetchGotmRounds({
      kind: "both",
      year: null,
      q: "",
      sort: "desc",
      page: 1,
    }),
    fetchVotingRound(),
  ]);
  const { nominations, now } = await fetchRoundNominations(voting);

  // `gotm_rounds/current` is the GOTM round with the same round's NR-GOTM,
  // N/A placeholders already dropped.
  const gotm = round?.gotm?.games.length ? round.gotm : null;
  const nrGotm = round?.nr_gotm?.games.length ? round.nr_gotm : null;
  const previous = (history?.rounds ?? [])
    .filter((r) => r.round_number !== round?.round_number)
    .slice(0, PREVIOUS_ROUNDS);

  const panel = voting && (
    <RoundPanel
      round={voting}
      nominations={nominations}
      viewerId={session.principal.id}
      now={now}
      tall={!(gotm && nrGotm)}
    />
  );

  if (!round || (!gotm && !nrGotm)) {
    return (
      <div className="space-y-10">
        <div className="grid gap-5 lg:grid-cols-[1fr_23rem]">
          <NoRound />
          {panel}
        </div>
        <PreviousRounds rounds={previous} />
      </div>
    );
  }

  const cover = gotm ? (
    <CoverStory
      kind="gotm"
      roundNumber={round.round_number}
      monthYear={gotm.month_year}
      games={gotm.games}
      votingResultsMessageId={gotm.voting_results_message_id}
    />
  ) : (
    <CoverStory
      kind="nr_gotm"
      roundNumber={round.round_number}
      monthYear={nrGotm!.month_year}
      games={nrGotm!.games}
      votingResultsMessageId={nrGotm!.voting_results_message_id}
      absentNote="No Game of the Month this round"
    />
  );
  const rail =
    gotm && nrGotm ? (
      <div className="grid content-start gap-5 lg:grid-rows-[1fr_auto]">
        <NrFeature
          roundNumber={round.round_number}
          games={nrGotm.games}
          votingResultsMessageId={nrGotm.voting_results_message_id}
        />
        {panel}
      </div>
    ) : (
      panel
    );

  return (
    <div className="space-y-10">
      <div
        className={cn(
          "grid gap-5",
          rail && "lg:grid-cols-[1fr_23rem]",
        )}
      >
        {cover}
        {rail}
      </div>
      <PreviousRounds rounds={previous} />
    </div>
  );
}

// Both tracks' nominations, newest first, for the panel's count and list,
// stamped with the time they were read so the days-left count is taken
// against the same moment.
async function fetchRoundNominations(
  voting: VotingRound | null,
): Promise<{ nominations: TrackedNomination[]; now: number }> {
  if (!voting || !["nominating", "voting"].includes(voting.phase)) {
    return { nominations: [], now: Date.now() };
  }
  const [gotm, nr] = await Promise.all([
    fetchNominations("gotm", voting.round_number),
    fetchNominations("nr_gotm", voting.round_number),
  ]);
  const nominations = [
    ...gotm.map((n) => ({ ...n, category: "gotm" as const })),
    ...nr.map((n) => ({ ...n, category: "nr_gotm" as const })),
  ].sort(
    (a, b) =>
      new Date(b.nominated_at).getTime() - new Date(a.nominated_at).getTime(),
  );
  return { nominations, now: Date.now() };
}

function NoRound() {
  return (
    <section className="flex min-h-64 flex-col justify-end gap-3 rounded-md border border-dashed border-rule-strong p-7">
      <h2 className="font-headline text-4xl">No winners yet</h2>
      <p className="max-w-[48ch] text-paper-dim">
        This round&apos;s Game of the Month hasn&apos;t been decided. Once the
        vote is in, the winners land here.
      </p>
      <Link href="/gotm" className={headingLinkClass}>
        Full history
        <ArrowRight aria-hidden />
      </Link>
    </section>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-10">
      <div className="grid gap-5 lg:grid-cols-[1fr_23rem]">
        <Skeleton className="min-h-[30rem] rounded-md lg:min-h-[32rem]" />
        <div className="grid gap-5 lg:grid-rows-[1fr_auto]">
          <Skeleton className="min-h-60 rounded-md" />
          <Skeleton className="h-40 rounded-md" />
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-10 w-72 rounded-sm" />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-40 rounded-sm" />
          ))}
        </div>
      </div>
    </div>
  );
}

