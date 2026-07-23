import { Suspense } from "react";
import { Gamepad2, Trophy, Vote, type LucideIcon } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type {
  Nomination,
  NominationVote,
  VoteTallyRow,
  VotingCategory,
  VotingInfo,
} from "@/lib/api/types";
import { NominationBoard } from "@/components/voting/nomination-board";
import { NominatePanel } from "@/components/voting/nominate-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { getSession } from "@/lib/session";

const CATEGORY_PATH: Record<VotingCategory, string> = {
  gotm: "gotm_entries",
  nr_gotm: "nr_gotm_entries",
};

// Round layout mirrors the club lifecycle: voting targets the CURRENT round
// (voting_info/current — its ballot was nominated last cycle), while
// nominations collect for the NEXT round (current + 1) until the current
// round's vote opens. The backend enforces both windows; this page just
// renders the same split. The ballot's games only render while the voting
// window is open — before it opens and after it closes, a notice stands in.

// Everything here is no-store: tallies move as other members vote, the page
// embeds the viewer's own votes and nomination, and the windows can flip
// between renders.

async function fetchVotingInfo(): Promise<VotingInfo | null> {
  try {
    const res = await apiFetch("/api/v1/voting_info/current", {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return ((await res.json()) as { data: VotingInfo }).data;
  } catch {
    return null;
  }
}

async function fetchNominations(
  category: VotingCategory,
  round: number,
): Promise<Nomination[]> {
  try {
    const res = await apiFetch(
      `/api/v1/${CATEGORY_PATH[category]}/${round}/nominations?limit=200`,
      { cache: "no-store" },
    );
    if (!res.ok) return [];
    return ((await res.json()) as { data: Nomination[] }).data;
  } catch {
    return [];
  }
}

async function fetchTally(
  category: VotingCategory,
  round: number,
): Promise<{ rows: VoteTallyRow[]; cap: number }> {
  try {
    const res = await apiFetch(
      `/api/v1/${CATEGORY_PATH[category]}/${round}/votes/tally`,
      { cache: "no-store" },
    );
    if (!res.ok) return { rows: [], cap: 2 };
    const body = (await res.json()) as {
      data: VoteTallyRow[];
      meta: { cap: number };
    };
    return { rows: body.data, cap: body.meta.cap };
  } catch {
    return { rows: [], cap: 2 };
  }
}

async function fetchUserVotes(
  category: VotingCategory,
  round: number,
  userId: string,
): Promise<NominationVote[]> {
  try {
    const res = await apiFetch(
      `/api/v1/${CATEGORY_PATH[category]}/${round}/votes/${userId}`,
      { cache: "no-store" },
    );
    if (!res.ok) return [];
    return ((await res.json()) as { data: NominationVote[] }).data;
  } catch {
    return [];
  }
}

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

  const round = info.round_number;
  const nextRound = round + 1;
  // Mirrors BotVotingInfo.nominations_open_for?: the next round accepts
  // nominations until the current round's vote opens.
  const nominationsOpen = !info.voting_open && !info.voting_ended;
  const votingOpen = info.voting_open;
  const userId = session?.principal.id;

  // The ballot only renders while voting is open, so its data (nominations,
  // tally, the viewer's votes) isn't fetched outside that window.
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
    votingOpen ? fetchNominations("gotm", round) : [],
    votingOpen ? fetchNominations("nr_gotm", round) : [],
    votingOpen ? fetchTally("gotm", round) : emptyTally,
    votingOpen ? fetchTally("nr_gotm", round) : emptyTally,
    votingOpen && userId ? fetchUserVotes("gotm", round, userId) : [],
    votingOpen && userId ? fetchUserVotes("nr_gotm", round, userId) : [],
    fetchNominations("gotm", nextRound),
    fetchNominations("nr_gotm", nextRound),
  ]);

  const categories = [
    {
      category: "gotm" as const,
      title: "Game of the Month",
      accent: "emerald" as const,
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
    <div className="space-y-10">
      <PageHeader info={info} />

      {categories.map((c) => (
        <section key={c.category} className="space-y-4">
          <SectionHeader title={c.title} accent={c.accent} Icon={c.Icon} />

          <div className="space-y-3">
            <SubHeading
              label={`Round ${round} · Ballot`}
              detail={ballotDetail(info)}
            />
            {votingOpen ? (
              <NominationBoard
                category={c.category}
                round={round}
                accent={c.accent}
                nominations={c.ballot}
                tally={c.tally.rows}
                cap={c.tally.cap}
                userVotes={c.userVotes}
                votingOpen
                votingEnded={false}
                emptyMessage="No games on this round's ballot."
              />
            ) : (
              <p className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
                {info.voting_ended
                  ? `Voting for Round ${round} has closed.`
                  : "The ballot is revealed when voting opens."}
              </p>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <SubHeading
              label={`Round ${nextRound} · Nominations`}
              detail={
                nominationsOpen
                  ? `Open until ${formatEt(info.next_vote_at)}`
                  : "Closed until the next round is scheduled"
              }
            />
            {userId && (
              <NominatePanel
                category={c.category}
                round={nextRound}
                accent={c.accent}
                open={nominationsOpen}
                existing={
                  c.next.find((n) => n.user_id === userId) ?? null
                }
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
              emptyMessage={
                nominationsOpen
                  ? "No nominations yet — be the first!"
                  : "No nominations yet."
              }
            />
          </div>
        </section>
      ))}
    </div>
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
      `Nominate games for Round ${nextRound} below — voting on the ` +
      `Round ${info.round_number} ballot opens ${formatEt(info.next_vote_at)}.`,
  };
}

function ballotDetail(info: VotingInfo): string {
  if (info.voting_ended) return "Voting closed";
  if (info.voting_open) return "Vote now";
  return `Voting opens ${formatEt(info.next_vote_at)}`;
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
  emerald: {
    icon: "text-emerald-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]",
    gradient: "from-emerald-200 via-emerald-300 to-emerald-500",
    underline: "from-emerald-500/60 via-emerald-500/20 to-transparent",
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
        <Icon className={`h-6 w-6 ${style.icon}`} strokeWidth={1.75} />
        <h2
          className={`bg-linear-to-r ${style.gradient} bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl`}
        >
          {title}
        </h2>
      </div>
      <div className={`h-px w-full bg-linear-to-r ${style.underline}`} />
    </header>
  );
}

function SubHeading({ label, detail }: { label: string; detail?: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </h3>
      {detail && (
        <p className="text-xs text-muted-foreground/80">{detail}</p>
      )}
    </div>
  );
}

function VotingSkeleton() {
  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-96" />
      </div>
      {[0, 1].map((section) => (
        <div key={section} className="space-y-3">
          <Skeleton className="h-8 w-64" />
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
  );
}
