import { Suspense } from "react";
import {
  ChevronRight,
  Gamepad2,
  Trophy,
  Vote,
  type LucideIcon,
} from "lucide-react";
import type { VotingCategory, VotingInfo } from "@/lib/api/types";
import {
  ballotIsPublic,
  fetchNominations,
  fetchTally,
  fetchUserVotes,
  fetchVotingInfo,
  VOTING_CATEGORIES,
  VOTING_CATEGORY_TITLE,
} from "@/lib/api/voting-round";
import { NominationBoard } from "@/components/voting/nomination-board";
import { NominatePanel } from "@/components/voting/nominate-panel";
import { accentForCategory } from "@/components/voting/accents";
import { Skeleton } from "@/components/ui/skeleton";
import { getSession } from "@/lib/session";

// Round layout mirrors the club lifecycle: voting targets the CURRENT round
// (voting_info/current — its ballot was nominated last cycle), while
// nominations collect for the NEXT round (current + 1) until the current
// round's vote opens. The backend enforces both windows; this page just
// renders the same split.
//
// The two windows are exact complements — the ballot is public when voting is
// open or ended, the nomination window is neither — so the page renders one
// phase, not a choice between them. Tabs were the wrong control here: with
// only one window ever live, the other tab led to an empty view that repeated
// the header. What the closed phase is still worth saying, and PageHeader
// says it in a sentence.

const CATEGORY_ICON: Record<VotingCategory, LucideIcon> = {
  gotm: Trophy,
  nr_gotm: Gamepad2,
};

const CATEGORY_COLUMNS = VOTING_CATEGORIES.map((category) => ({
  category,
  title: VOTING_CATEGORY_TITLE[category],
  accent: accentForCategory[category],
  Icon: CATEGORY_ICON[category],
}));

export default function VotingPage() {
  return (
    <Suspense fallback={<VotingSkeleton />}>
      <VotingContent />
    </Suspense>
  );
}

async function VotingContent() {
  const [info, session] = await Promise.all([fetchVotingInfo(), getSession()]);

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

  const viewerId = session?.principal.id;
  const nextRound = info.round_number + 1;

  return (
    <div className="space-y-6">
      <PageHeader info={info} />

      {ballotIsPublic(info) ? (
        <>
          <BallotPhase info={info} viewerId={viewerId} />
          {/* Nominations for the next round closed when this round's vote
              opened, so the queue is final but not yet a ballot. It streams
              in folded away — browsable, never competing with the vote. */}
          <Suspense fallback={null}>
            <QueuedNominations round={nextRound} viewerId={viewerId} />
          </Suspense>
        </>
      ) : (
        <NominatePhase round={nextRound} viewerId={viewerId} />
      )}
    </div>
  );
}

async function BallotPhase({
  info,
  viewerId,
}: {
  info: VotingInfo;
  viewerId?: string;
}) {
  const round = info.round_number;
  const columns = await Promise.all(
    CATEGORY_COLUMNS.map(async (column) => {
      const [nominations, tally, userVotes] = await Promise.all([
        fetchNominations(column.category, round),
        fetchTally(column.category, round),
        // Own votes are only readable — and only castable — while the window
        // is open; a finished round is just its tally.
        info.voting_open && viewerId
          ? fetchUserVotes(column.category, round, viewerId)
          : Promise.resolve([]),
      ]);
      return { column, nominations, tally, userVotes };
    }),
  );

  return (
    <PhaseGrid>
      {columns.map(({ column, nominations, tally, userVotes }) => (
        <PhaseColumn key={column.category} column={column}>
          <NominationBoard
            category={column.category}
            round={round}
            accent={column.accent}
            nominations={nominations}
            tally={tally.rows}
            cap={tally.cap}
            userVotes={userVotes}
            votingOpen={info.voting_open}
            votingEnded={info.voting_ended}
            viewerId={viewerId}
            emptyMessage="No games on this round's ballot."
          />
        </PhaseColumn>
      ))}
    </PhaseGrid>
  );
}

async function NominatePhase({
  round,
  viewerId,
}: {
  round: number;
  viewerId?: string;
}) {
  const columns = await Promise.all(
    CATEGORY_COLUMNS.map(async (column) => ({
      column,
      nominations: await fetchNominations(column.category, round),
    })),
  );

  return (
    <PhaseGrid>
      {columns.map(({ column, nominations }) => (
        <PhaseColumn key={column.category} column={column}>
          <div className="space-y-3">
            {viewerId && (
              <NominatePanel
                category={column.category}
                round={round}
                accent={column.accent}
                // This branch only renders inside the nomination window.
                open
                existing={
                  nominations.find((n) => n.user_id === viewerId) ?? null
                }
              />
            )}
            <NominationBoard
              category={column.category}
              round={round}
              accent={column.accent}
              nominations={nominations}
              tally={[]}
              cap={0}
              userVotes={[]}
              votingOpen={false}
              votingEnded={false}
              viewerId={viewerId}
              emptyMessage="No nominations yet — be the first!"
            />
          </div>
        </PhaseColumn>
      ))}
    </PhaseGrid>
  );
}

// The next round's locked queue, shown under a live or finished ballot. A
// native <details> so it costs no client JS and survives with none.
async function QueuedNominations({
  round,
  viewerId,
}: {
  round: number;
  viewerId?: string;
}) {
  const columns = await Promise.all(
    CATEGORY_COLUMNS.map(async (column) => ({
      column,
      nominations: await fetchNominations(column.category, round),
    })),
  );

  const total = columns.reduce((sum, c) => sum + c.nominations.length, 0);
  if (!total) return null;

  return (
    <details className="group rounded-xl border bg-card/40">
      <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1 rounded-xl px-4 py-3 transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden [&::-webkit-details-marker]:hidden">
        <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90 motion-reduce:transition-none" />
        <span className="text-sm font-semibold tracking-tight">
          Round {round} nominations
        </span>
        <span className="text-xs text-muted-foreground">
          Locked · {total} queued for the next vote
        </span>
      </summary>
      <div className="grid gap-8 border-t p-4 sm:p-5 xl:grid-cols-2">
        {columns.map(({ column, nominations }) => (
          <PhaseColumn key={column.category} column={column}>
            <NominationBoard
              category={column.category}
              round={round}
              accent={column.accent}
              nominations={nominations}
              tally={[]}
              cap={0}
              userVotes={[]}
              votingOpen={false}
              votingEnded={false}
              viewerId={viewerId}
              emptyMessage="No nominations for this round."
            />
          </PhaseColumn>
        ))}
      </div>
    </details>
  );
}

function PhaseGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-8 xl:grid-cols-2">{children}</div>;
}

function PhaseColumn({
  column,
  children,
}: {
  column: (typeof CATEGORY_COLUMNS)[number];
  children: React.ReactNode;
}) {
  return (
    // min-w-0: as a grid item the section defaults to min-width:auto, which on
    // narrow screens holds it at its ~418px min-content and pushes the cards
    // past the right edge of the page.
    <section className="min-w-0 space-y-4">
      <SectionHeader
        title={column.title}
        accent={column.accent}
        Icon={column.Icon}
      />
      {children}
    </section>
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

// Carries the whole phase: which window is live, and when the other one
// arrives. With no tabs this is the only place that states the lifecycle, so
// it names both sides.
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
        ? `Voting for Round ${info.round_number} is open until ${formatEt(info.vote_deadline)}. Round ${nextRound} nominations are closed.`
        : `Voting for Round ${info.round_number} is open. Round ${nextRound} nominations are closed.`,
    };
  }
  return {
    label: "Nominations open",
    detail:
      `Nominating for Round ${nextRound} is open. Voting on the ` +
      `Round ${info.round_number} ballot opens ${formatEt(info.next_vote_at)}.`,
  };
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
      <div className="grid gap-8 xl:grid-cols-2">
        {[0, 1].map((section) => (
          <div key={section} className="space-y-4">
            <Skeleton className="h-7 w-56" />
            <div className="space-y-3">
              {/* Matches the showcase cards the board renders. */}
              {[0, 1, 2].map((card) => (
                <Skeleton key={card} className="h-40 rounded-xl sm:h-48" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
