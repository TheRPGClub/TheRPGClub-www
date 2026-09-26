import { Suspense } from "react";
import {
  Gamepad2,
  Trophy,
  Vote,
  type LucideIcon,
} from "lucide-react";
import type { VotingCategory, VotingRound } from "@/lib/api/types";
import {
  ballotIsPublic,
  fetchNominations,
  fetchTally,
  fetchUserVotes,
  fetchVotingRound,
  VOTING_CATEGORIES,
  VOTING_CATEGORY_TITLE,
} from "@/lib/api/voting-round";
import { NominationBoard } from "@/components/voting/nomination-board";
import { NominatePanel } from "@/components/voting/nominate-panel";
import { accentForCategory } from "@/components/voting/accents";
import { Skeleton } from "@/components/ui/skeleton";
import { getSession } from "@/lib/session";

// One round at a time, as the backend reports it on voting_rounds/current:
// members nominate for it, then vote on those same nominations, then it is
// decided and the backend schedules the next. The backend owns which round
// that is and enforces every window; this page never derives a round number.
//
// The phases are exact complements — nominations close the moment the vote
// opens, and the ballot is public from then on — so the page renders one
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
  const [round, session] = await Promise.all([
    fetchVotingRound(),
    getSession(),
  ]);

  if (!round) {
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

  return (
    <div className="space-y-6">
      <PageHeader round={round} />

      {ballotIsPublic(round) ? (
        <BallotPhase round={round} viewerId={viewerId} />
      ) : (
        <NominatePhase round={round.round_number} viewerId={viewerId} />
      )}
    </div>
  );
}

async function BallotPhase({
  round,
  viewerId,
}: {
  round: VotingRound;
  viewerId?: string;
}) {
  const roundNumber = round.round_number;
  const columns = await Promise.all(
    CATEGORY_COLUMNS.map(async (column) => {
      const [nominations, tally, userVotes] = await Promise.all([
        fetchNominations(column.category, roundNumber),
        fetchTally(column.category, roundNumber),
        // Own votes are only readable — and only castable — while the window
        // is open; a finished round is just its tally.
        round.voting_open && viewerId
          ? fetchUserVotes(column.category, roundNumber, viewerId)
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
            round={roundNumber}
            accent={column.accent}
            nominations={nominations}
            tally={tally.rows}
            cap={tally.cap}
            userVotes={userVotes}
            votingOpen={round.voting_open}
            votingEnded={round.voting_ended}
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

// The club schedules rounds in US Eastern (see Voting::Schedule), so render the
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
//
// `title` is the heading and names the action, since the page only ever offers
// one; `label` is the round pill's state and `detail` the sentence under it.
function phaseStatus(voting: VotingRound): {
  title: string;
  label: string;
  detail: string;
} {
  const round = voting.round_number;
  switch (voting.phase) {
    case "nominating":
      return {
        title: "Nominate a game",
        label: "Nominations open",
        detail:
          `Nominating for Round ${round} is open until voting on its ballot ` +
          `opens ${formatEt(voting.voting_opens_at)}.`,
      };
    case "voting":
      return {
        title: "Cast your votes",
        label: "Voting open",
        detail:
          `Voting for Round ${round} is open until ` +
          `${formatEt(voting.voting_closes_at)}. Nominations are closed.`,
      };
    case "tie":
      return {
        title: `Round ${round} results`,
        label: "Tie",
        detail:
          `Voting for Round ${round} ended in a tie. The admins will pick ` +
          "the winner, then nominations open for the next round.",
      };
    case "closed":
    case "decided":
      return {
        title: `Round ${round} results`,
        label: "Voting closed",
        detail:
          `Voting for Round ${round} has ended. Nominations for the next ` +
          "round open once the winners are recorded.",
      };
  }
}

function PageHeader({ round }: { round?: VotingRound }) {
  const status = round ? phaseStatus(round) : null;
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <Vote className="h-7 w-7 text-muted-foreground" strokeWidth={1.75} />
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {/* Falls back to the section's own name when there is no round to
              have a phase. */}
          {status?.title ?? "Nominations & Voting"}
        </h1>
        {round && (
          <span className="rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Round {round.round_number} · {status?.label}
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
