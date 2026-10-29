import { Suspense } from "react";
import type {
  Nomination,
  NominationVote,
  VotingCategory,
  VotingRound,
} from "@/lib/api/types";
import {
  ballotIsPublic,
  fetchNominations,
  fetchTally,
  fetchUserVotes,
  fetchVotingRound,
  tallyByGame,
  VOTING_CATEGORIES,
  type RoundTally,
} from "@/lib/api/voting-round";
import { NominationBoard } from "@/components/voting/nomination-board";
import { NominatePanel } from "@/components/voting/nominate-panel";
import { VotingTabs } from "@/components/voting/voting-tabs";
import {
  VotingStrip,
  type StripClock,
  type StripSlot,
} from "@/components/issue/voting-strip";
import { PageHeader } from "@/components/issue/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { getSession } from "@/lib/session";

// One round at a time, as the backend reports it on voting_rounds/current:
// members nominate for it, then vote on those same nominations, then it is
// decided and the backend schedules the next. The backend owns which round
// that is and enforces every window; this page never derives a round number.
//
// The page is the ballot: a yellow strip with the live window's clock and the
// viewer's own business per track (their nomination while nominating, their
// votes while voting, the result after), over a tabbed board of every
// nomination as a cover tile. Before the vote opens the board lists the
// nominations without counts; from then on it is the ballot and its tally.

const TAB_LABEL: Record<VotingCategory, string> = {
  gotm: "Game of the Month",
  nr_gotm: "Non-RPG",
};

const TRACK_NAME: Record<VotingCategory, string> = {
  gotm: "GOTM",
  nr_gotm: "NR-GOTM",
};

const DAY_MS = 24 * 60 * 60 * 1000;

export default function VotingPage() {
  return (
    <Suspense fallback={<VotingSkeleton />}>
      <VotingContent />
    </Suspense>
  );
}

interface TrackData {
  category: VotingCategory;
  nominations: Nomination[];
  tally: RoundTally;
  userVotes: NominationVote[];
}

// Both tracks' nominations, plus the tally and the viewer's own votes once the
// ballot is public, stamped with the time they were read so the clock counts
// down from the same moment.
async function loadRound(
  round: VotingRound,
  viewerId: string | undefined,
): Promise<{ tracks: TrackData[]; now: number }> {
  const ballot = ballotIsPublic(round);
  const tracks = await Promise.all(
    VOTING_CATEGORIES.map(async (category) => {
      const [nominations, tally, userVotes] = await Promise.all([
        fetchNominations(category, round.round_number),
        ballot
          ? fetchTally(category, round.round_number)
          : Promise.resolve({ rows: [], cap: 0 }),
        // Own votes are only readable (and only castable) while the window
        // is open; a finished round is just its tally.
        round.voting_open && viewerId
          ? fetchUserVotes(category, round.round_number, viewerId)
          : Promise.resolve([]),
      ]);
      return { category, nominations, tally, userVotes };
    }),
  );
  return { tracks, now: Date.now() };
}

async function VotingContent() {
  const [round, session] = await Promise.all([
    fetchVotingRound(),
    getSession(),
  ]);

  if (!round) {
    return (
      <div className="space-y-6">
        <PageHeader title="Nominations & voting" />
        <p className="rounded-md border border-dashed border-rule-strong px-4 py-12 text-center text-paper-dim">
          No voting round is scheduled right now. Check back soon!
        </p>
      </div>
    );
  }

  const viewerId = session?.principal.id;
  const { tracks, now } = await loadRound(round, viewerId);
  const ballot = ballotIsPublic(round);
  const phase = phaseCopy(round, now);

  const slots: StripSlot[] = tracks.map((track) => {
    const own = viewerId
      ? (track.nominations.find((n) => n.user_id === viewerId) ?? null)
      : null;
    if (round.phase === "nominating") {
      return {
        category: track.category,
        title: `Your ${TRACK_NAME[track.category]} nomination`,
        content: viewerId ? (
          <NominatePanel
            category={track.category}
            round={round.round_number}
            // This branch only renders inside the nomination window.
            open
            existing={own}
          />
        ) : (
          <SlotNote>Sign in to nominate.</SlotNote>
        ),
      };
    }
    if (round.voting_open) {
      return {
        category: track.category,
        title: `Your ${TRACK_NAME[track.category]} votes`,
        content: <VotesSlot track={track} own={own} signedIn={!!viewerId} />,
      };
    }
    return {
      category: track.category,
      title: `${TRACK_NAME[track.category]} result`,
      content: <ResultSlot round={round} track={track} />,
    };
  });

  return (
    <div className="space-y-7">
      <PageHeader
        title={phase.title}
        count={`Round ${round.round_number} · ${round.month_year}`}
      />

      <VotingStrip
        label={`Round ${round.round_number} ${phase.title.toLowerCase()}`}
        clock={phase.clock}
        slots={slots}
      />

      <VotingTabs
        tabs={tracks.map((track) => ({
          category: track.category,
          label: TAB_LABEL[track.category],
          count: track.nominations.length,
          panel: (
            <NominationBoard
              category={track.category}
              round={round.round_number}
              nominations={track.nominations}
              tally={track.tally.rows}
              cap={track.tally.cap}
              userVotes={track.userVotes}
              votingOpen={round.voting_open}
              votingEnded={round.voting_ended}
              viewerId={viewerId}
              emptyMessage={
                ballot
                  ? "No games on this round's ballot."
                  : "No nominations yet. Be the first!"
              }
            />
          ),
        }))}
      />
    </div>
  );
}

// While voting: how many of the cap the viewer has cast, on what, and their
// own nomination on the ballot. Refreshes with the page after each vote.
function VotesSlot({
  track,
  own,
  signedIn,
}: {
  track: TrackData;
  own: Nomination | null;
  signedIn: boolean;
}) {
  if (!signedIn) return <SlotNote>Sign in to vote.</SlotNote>;
  const { cap } = track.tally;
  const titleOf = (vote: NominationVote) =>
    vote.game?.title ??
    track.nominations.find((n) => n.nomination_id === vote.nomination_id)?.game
      ?.title ??
    "Unknown game";

  return (
    <div className="flex flex-1 flex-col gap-2">
      <p className="flex items-baseline gap-2">
        <span className="font-headline text-[2.6rem] leading-[0.85]">
          {track.userVotes.length}
          <span className="text-highlight-ink"> / {cap}</span>
        </span>
        <span className="font-label text-[0.85rem] font-extrabold tracking-[0.08em]">
          votes cast
        </span>
      </p>
      {track.userVotes.length > 0 ? (
        <ul className="space-y-0.5">
          {track.userVotes.map((vote) => (
            <li
              key={vote.vote_id}
              className="font-label truncate text-[0.95rem] font-extrabold tracking-[0.02em]"
            >
              {titleOf(vote)}
            </li>
          ))}
        </ul>
      ) : (
        <SlotNote>
          {track.nominations.length > 0
            ? "Pick up to " + cap + " games on the board below."
            : "Nothing on this ballot."}
        </SlotNote>
      )}
      {own && (
        <p className="mt-auto text-[0.82rem] font-medium text-highlight-ink">
          Your nomination: {own.game?.title ?? "Unknown game"}
        </p>
      )}
    </div>
  );
}

// After the vote: the game(s) with the most votes, or the tie the admins are
// settling. A game nominated twice counts both nominations' votes.
function ResultSlot({
  round,
  track,
}: {
  round: VotingRound;
  track: TrackData;
}) {
  const tied = round.pending_ties[track.category] ?? [];
  if (tied.length > 0) {
    return (
      <div className="space-y-1">
        <p className="font-headline text-[1.75rem] leading-[0.95] text-balance">
          {tied.map((game) => game.title).join(" / ")}
        </p>
        <p className="text-[0.82rem] font-medium text-highlight-ink">
          Tied. The admins will pick the winner.
        </p>
      </div>
    );
  }

  const byGame = tallyByGame(track.tally.rows);
  const top = Math.max(0, ...byGame.values());
  if (top === 0) {
    return (
      <SlotNote>
        {track.nominations.length > 0
          ? "No votes were cast."
          : "Nothing was on this ballot."}
      </SlotNote>
    );
  }
  const leaders = [...byGame.entries()]
    .filter(([, count]) => count === top)
    .map(
      ([gameId]) =>
        track.nominations.find((n) => n.gamedb_game_id === gameId)?.game
          ?.title ?? "Unknown game",
    );

  return (
    <div className="space-y-1">
      <p className="font-headline text-[1.75rem] leading-[0.95] text-balance">
        {leaders.join(" / ")}
      </p>
      <p className="text-[0.82rem] font-medium text-highlight-ink">
        Most votes, with {top} {top === 1 ? "vote" : "votes"}.
      </p>
    </div>
  );
}

function SlotNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.85rem] font-medium text-highlight-ink">{children}</p>
  );
}

// The club schedules rounds in US Eastern (see Voting::Schedule), so render the
// window boundaries in that zone rather than the server's.
function formatEt(iso: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("weekday")}, ${get("month")} ${get("day")} · ${get("hour")}:${get("minute")} ${get("dayPeriod")} ET`;
}

function daysUntil(iso: string, now: number): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - now) / DAY_MS));
}

// The whole phase in one place: the page title names what the round is
// doing, and the clock says how long it has left or how it ended.
function phaseCopy(
  round: VotingRound,
  now: number,
): { title: string; clock: StripClock } {
  const n = round.round_number;
  switch (round.phase) {
    case "nominating": {
      const days = daysUntil(round.voting_opens_at, now);
      return {
        title: "Nominations",
        clock: {
          figure: String(days),
          label: `${days === 1 ? "Day" : "Days"} of nominations left`,
          detail: `Voting opens ${formatEt(round.voting_opens_at)}`,
        },
      };
    }
    case "voting": {
      const days = daysUntil(round.voting_closes_at, now);
      return {
        title: "Voting",
        clock: {
          figure: String(days),
          label: `${days === 1 ? "Day" : "Days"} of voting left`,
          detail: `Voting closes ${formatEt(round.voting_closes_at)}. Nominations are closed.`,
        },
      };
    }
    case "tie":
      return {
        title: "Results",
        clock: {
          figure: "Tie",
          label: "Voting ended in a tie",
          detail: `The admins will pick Round ${n}'s winner, then nominations open for the next round.`,
        },
      };
    case "closed":
    case "decided":
      return {
        title: "Results",
        clock: {
          figure: "Closed",
          label: "Voting has ended",
          detail: `Nominations for the next round open once Round ${n}'s winners are recorded.`,
        },
      };
  }
}

function VotingSkeleton() {
  return (
    <div className="space-y-7">
      <PageHeader title="Nominations" />
      <Skeleton className="h-48 rounded-md" />
      <div className="space-y-5">
        <Skeleton className="h-11.5 w-96 max-w-full rounded-sm" />
        <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[3/4] w-full rounded-sm" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
