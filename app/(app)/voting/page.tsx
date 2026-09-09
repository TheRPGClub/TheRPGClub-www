import { Suspense } from "react";
import { Gamepad2, Trophy, Vote, type LucideIcon } from "lucide-react";
import type { VoteTallyRow, VotingInfo } from "@/lib/api/types";
import {
  ballotIsPublic,
  fetchNominations,
  fetchTally,
  fetchUserVotes,
  fetchVotingInfo,
} from "@/lib/api/voting-round";
import { NominationBoard } from "@/components/voting/nomination-board";
import { NominatePanel } from "@/components/voting/nominate-panel";
import {
  PhaseSwitcher,
  type PhaseSegment,
  type VotingPhase,
} from "@/components/voting/phase-switcher";
import { Skeleton } from "@/components/ui/skeleton";
import { getSession } from "@/lib/session";

// Round layout mirrors the club lifecycle: voting targets the CURRENT round
// (voting_info/current — its ballot was nominated last cycle), while
// nominations collect for the NEXT round (current + 1) until the current
// round's vote opens. The backend enforces both windows; this page just
// renders the same split.
//
// The two windows are mutually exclusive by construction (nominationsOpen is
// derived as "not voting"), so the page shows one phase at a time and defaults
// to whichever is live. `?phase=` overrides that, which keeps the switch on the
// server: each tab is a link, so the per-phase fetching below stays honest and
// a phase is linkable ("come vote: /voting?phase=vote").

export default function VotingPage({ searchParams }: PageProps<"/voting">) {
  return (
    <Suspense fallback={<VotingSkeleton />}>
      <VotingContent searchParams={searchParams} />
    </Suspense>
  );
}

async function VotingContent({
  searchParams,
}: {
  searchParams: PageProps<"/voting">["searchParams"];
}) {
  const [info, session, params] = await Promise.all([
    fetchVotingInfo(),
    getSession(),
    searchParams,
  ]);

  if (!info) {
    return (
      <div className="space-y-4">
        <PageHeader />
        <p className="text-muted-foreground">
          No voting round is scheduled right now. Check back soon!
        </p>
      </div>
    );
  }

  const round = info.round_number;
  const nextRound = round + 1;
  // Mirrors BotVotingInfo.nominations_open_for?: the next round accepts
  // nominations until the current round's vote opens.
  const nominationsOpen = !info.voting_open && !info.voting_ended;
  const votingOpen = info.voting_open;
  const userId = session?.principal.id;

  const live: VotingPhase | null = votingOpen
    ? "vote"
    : nominationsOpen
      ? "nominate"
      : null;
  const requested = params.phase;
  // An array (?phase=vote&phase=nominate) never matches either literal, so a
  // duplicated param falls through to the live phase rather than throwing.
  // Falls back to "vote" when neither window is open, so a finished round
  // lands on its results rather than a closed nomination form.
  const phase: VotingPhase =
    requested === "vote" || requested === "nominate"
      ? requested
      : (live ?? "vote");

  const showBallot = phase === "vote" && ballotIsPublic(info);
  const showNominations = phase === "nominate";

  // Only the visible phase is fetched — the other tab's data is a link away.
  const emptyTally = { rows: [] as VoteTallyRow[], cap: 2 };
  const [
    gotmBallot,
    nrBallot,
    gotmTally,
    nrTally,
    gotmVotes,
    nrVotes,
    gotmNext,
    nrNext,
  ] = await Promise.all([
    showBallot ? fetchNominations("gotm", round) : [],
    showBallot ? fetchNominations("nr_gotm", round) : [],
    showBallot ? fetchTally("gotm", round) : emptyTally,
    showBallot ? fetchTally("nr_gotm", round) : emptyTally,
    showBallot && votingOpen && userId
      ? fetchUserVotes("gotm", round, userId)
      : [],
    showBallot && votingOpen && userId
      ? fetchUserVotes("nr_gotm", round, userId)
      : [],
    showNominations ? fetchNominations("gotm", nextRound) : [],
    showNominations ? fetchNominations("nr_gotm", nextRound) : [],
  ]);

  const categories = [
    {
      category: "gotm" as const,
      title: "Game of the Month",
      accent: "brand" as const,
      Icon: Trophy,
      ballot: gotmBallot,
      tally: gotmTally,
      userVotes: gotmVotes,
      next: gotmNext,
    },
    {
      category: "nr_gotm" as const,
      title: "Non-RPG Game of the Month",
      accent: "purple" as const,
      Icon: Gamepad2,
      ballot: nrBallot,
      tally: nrTally,
      userVotes: nrVotes,
      next: nrNext,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader info={info} />

      <PhaseSwitcher active={phase} segments={phaseSegments(info)} />

      <div className="grid gap-8 xl:grid-cols-2">
        {categories.map((c) => (
          // min-w-0: as a grid item the section defaults to min-width:auto,
          // which on narrow screens holds it at its ~418px min-content and
          // pushes the cards past the right edge of the page.
          <section key={c.category} className="min-w-0 space-y-4">
            <SectionHeader title={c.title} accent={c.accent} Icon={c.Icon} />

            {phase === "vote" ? (
              showBallot ? (
                <NominationBoard
                  category={c.category}
                  round={round}
                  accent={c.accent}
                  nominations={c.ballot}
                  tally={c.tally.rows}
                  cap={c.tally.cap}
                  userVotes={c.userVotes}
                  votingOpen={votingOpen}
                  votingEnded={info.voting_ended}
                  viewerId={userId}
                  emptyMessage="No games on this round's ballot."
                />
              ) : (
                <EmptyNote>
                  The ballot is revealed when voting opens on{" "}
                  {formatEt(info.next_vote_at)}.
                </EmptyNote>
              )
            ) : (
              <div className="space-y-3">
                {userId && (
                  <NominatePanel
                    category={c.category}
                    round={nextRound}
                    accent={c.accent}
                    open={nominationsOpen}
                    existing={c.next.find((n) => n.user_id === userId) ?? null}
                  />
                )}
                <NominationBoard
                  category={c.category}
                  round={nextRound}
                  accent={c.accent}
                  nominations={c.next}
                  tally={[]}
                  cap={0}
                  userVotes={[]}
                  votingOpen={false}
                  votingEnded={false}
                  viewerId={userId}
                  emptyMessage={
                    nominationsOpen
                      ? "No nominations yet — be the first!"
                      : "No nominations yet."
                  }
                />
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
      {children}
    </p>
  );
}

// The club schedules rounds in US Eastern (see BotVotingInfo), so render the
// window boundaries in that zone rather than the server's.
function formatEt(iso: string): string {
  return `${new Date(iso).toLocaleString("en-US", {
    timeZone: "America/New_York",
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })} ET`;
}

// The tabs sit in a narrow column, so they get a short form of the window
// boundary; PageHeader still states it in full.
function shortEt(iso: string): string {
  const parts = new Date(iso).toLocaleString("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  });
  return `${parts.replace(",", "")} ET`;
}

function phaseStatus(info: VotingInfo): { label: string; detail: string } {
  const nextRound = info.round_number + 1;
  if (info.voting_ended) {
    return {
      label: "Voting closed",
      detail:
        `Voting for Round ${info.round_number} has ended. ` +
        `Round ${nextRound} nominations reopen when the next round is scheduled.`,
    };
  }
  if (info.voting_open) {
    return {
      label: "Voting open",
      detail: info.vote_deadline
        ? `Voting for Round ${info.round_number} is open until ${formatEt(info.vote_deadline)}.`
        : `Voting for Round ${info.round_number} is open.`,
    };
  }
  return {
    label: "Nominations open",
    detail:
      `Nominating for Round ${nextRound} is open. Voting on the ` +
      `Round ${info.round_number} ballot opens ${formatEt(info.next_vote_at)}.`,
  };
}

// Voting leads while its window is open; otherwise nominating takes the first
// slot, so the phase worth acting on is always the one you read first.
function phaseSegments(info: VotingInfo): PhaseSegment[] {
  const vote: PhaseSegment = {
    phase: "vote",
    label: "Vote",
    detail: voteDetail(info),
    accent: "brand",
  };
  const nominate: PhaseSegment = {
    phase: "nominate",
    label: "Nominate",
    detail: nominateDetail(info),
    accent: "purple",
  };
  return info.voting_open ? [vote, nominate] : [nominate, vote];
}

function voteDetail(info: VotingInfo): string {
  const round = info.round_number;
  if (info.voting_ended) return `Round ${round} results`;
  if (info.voting_open) {
    return info.vote_deadline
      ? `Round ${round} ballot closes ${shortEt(info.vote_deadline)}`
      : `Round ${round} ballot is open`;
  }
  return `Round ${round} ballot opens ${shortEt(info.next_vote_at)}`;
}

function nominateDetail(info: VotingInfo): string {
  const nextRound = info.round_number + 1;
  if (info.voting_ended) return `Round ${nextRound} opens with the next round`;
  if (info.voting_open) return `Round ${nextRound} opens when voting ends`;
  return `Round ${nextRound} closes ${shortEt(info.next_vote_at)}`;
}

function PageHeader({ info }: { info?: VotingInfo }) {
  const status = info ? phaseStatus(info) : null;
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <Vote className="h-7 w-7 text-muted-foreground" strokeWidth={1.75} />
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Nominations &amp; Voting
        </h1>
        {info && (
          <span className="rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Round {info.round_number} · {status?.label}
          </span>
        )}
      </div>
      {status && (
        <p className="mt-1.5 text-sm text-muted-foreground">{status.detail}</p>
      )}
    </div>
  );
}

const sectionAccent = {
  brand: {
    icon: "text-brand-300 drop-shadow-[0_0_8px_rgba(255,0,0,0.4)]",
    gradient: "from-brand-200 via-brand-300 to-brand-500",
    underline: "from-brand-500/60 via-brand-500/20 to-transparent",
  },
  purple: {
    icon: "text-purple-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]",
    gradient: "from-purple-200 via-purple-300 to-purple-500",
    underline: "from-purple-500/60 via-purple-500/20 to-transparent",
  },
} as const;

function SectionHeader({
  title,
  accent,
  Icon,
}: {
  title: string;
  accent: keyof typeof sectionAccent;
  Icon: LucideIcon;
}) {
  const style = sectionAccent[accent];
  return (
    <header className="space-y-2">
      <div className="flex items-center gap-3">
        <Icon className={`h-5 w-5 shrink-0 ${style.icon}`} strokeWidth={1.75} />
        <h2
          className={`bg-linear-to-r ${style.gradient} bg-clip-text text-xl font-bold tracking-tight text-transparent`}
        >
          {title}
        </h2>
      </div>
      <div className={`h-px w-full bg-linear-to-r ${style.underline}`} />
    </header>
  );
}

function VotingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="flex gap-2 border-b pb-3">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-10 w-56" />
      </div>
      <div className="grid gap-8 xl:grid-cols-2">
        {[0, 1].map((section) => (
          <div key={section} className="space-y-3">
            <Skeleton className="h-7 w-56" />
            <div className="space-y-3">
              {[0, 1, 2].map((row) => (
                <div key={row} className="rounded-xl border bg-card p-4">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-20 w-14 rounded-md" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-3 w-full max-w-md" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
