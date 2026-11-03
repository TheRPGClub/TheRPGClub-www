import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, cache } from "react";
import { ArrowRight } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import { isAdminOrAbove, isMemberOrStaff, isRegularOrStaff } from "@/lib/staff";
import type {
  ApiCollection,
  ApiSingle,
  Game,
  GameAchievementSet,
  GameRelations,
  Review,
  UserSummary,
  VotingCategory,
  VotingRound,
} from "@/lib/api/types";
import { paginationOf } from "@/lib/api/pagination";
import { uniqueUsers } from "@/lib/api/game-counts";
import { accentForGame } from "@/lib/reviews/accent";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import { GameReviewsList } from "@/components/member/game-reviews-list";
import { ClubSetPage } from "@/components/achievements/club-set-page";
import { GameAchievementTabs } from "@/components/achievements/game-achievement-tabs";
import { memberName } from "@/lib/achievements";
import {
  groupSetsByProvider,
  pickInitialTab,
  setSwitchLabel,
} from "@/lib/achievements/game-page";
import { getSetTint } from "@/lib/achievements/tint";
import { MEMBERS_REVALIDATE_SECONDS } from "@/lib/api/members";
import { GameImageUploadForm } from "@/components/game-image-upload-form";
import { RefreshReleasesButton } from "@/components/igdb/refresh-releases-button";
import { GameHero } from "@/components/issue/game-hero";
import { GameJournalSection } from "@/components/journal/game-journal-section";
import { GameThreads } from "@/components/game-links/game-threads";
import { LinkVersionForm } from "@/components/game-links/link-version-form";
import { GameHltb, GameHltbSkeleton } from "@/components/issue/game-hltb";
import {
  RailFacts,
  RailHeading,
  RailMembers,
} from "@/components/issue/game-rail";
import {
  SectionHeading,
  headingLinkClass,
} from "@/components/issue/page-header";
import {
  GameBallotPanel,
  type GameBallotPanelProps,
} from "@/components/voting/game-ballot-panel";
import { accentForCategory } from "@/components/voting/accents";
import {
  ballotIsPublic,
  fetchNominations,
  fetchTally,
  fetchUserVotes,
  fetchVotingRound,
  tallyByGame,
  VOTING_CATEGORIES,
  VOTING_CATEGORY_TITLE,
} from "@/lib/api/voting-round";
import { cn } from "@/lib/utils";

// A game's page is its cover story: the hero with the club's numbers, the
// round it's on the ballot for, then the reviews beside a rail of who's
// playing it, who finished it and the facts, and its other versions last.

// The page reads enough reviews to know whether the viewer already wrote one,
// and shows the first few as the crew strip.
const REVIEWS_READ = 5;
const REVIEWS_SHOWN = 3;

export default function GamePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<GameContentSkeleton />}>
      {Promise.all([params, searchParams]).then(([{ id }, query]) => {
        const gameId = parseInt(id, 10);
        if (isNaN(gameId)) notFound();
        return (
          <GameContent
            gameId={gameId}
            ach={firstParam(query.ach)}
            achSet={firstParam(query.ach_set)}
          />
        );
      })}
    </Suspense>
  );
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

// Read once per request: the details rail and the alternate versions both
// come out of it, and stream separately.
const fetchRelations = cache(
  async (gameId: number): Promise<GameRelations | null> => {
    const res = await apiFetch(`/api/v1/games/${gameId}/relations`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return ((await res.json()) as ApiSingle<GameRelations>).data;
  },
);

async function GameContent({
  gameId,
  ach,
  achSet,
}: {
  gameId: number;
  // The Achievement tab and set to open (`?ach=steam&ach_set=3`).
  ach?: string;
  achSet?: string;
}) {
  const [gameRes, session, reviewsRes] = await Promise.all([
    apiFetch(`/api/v1/games/${gameId}`),
    getSession(),
    apiFetch(`/api/v1/games/${gameId}/reviews?per=${REVIEWS_READ}`, {
      cache: "no-store",
    }),
  ]);

  if (!gameRes.ok) notFound();

  const { data: game }: ApiSingle<Game> = await gameRes.json();

  let reviews: Review[] = [];
  let reviewTotal: number | null = null;
  if (reviewsRes.ok) {
    const body: ApiCollection<Review> = await reviewsRes.json();
    reviews = body.data;
    reviewTotal = paginationOf(body.meta, reviews.length).total;
  }

  const players = uniqueUsers(game.now_playing ?? []);
  const completers = uniqueUsers(game.completions ?? []);

  // "Write review" unlocks once the user has at least started playing the
  // game (now_playing) or already finished it (completions).
  const ownerId = session?.principal.discord_id ?? null;
  const isPlaying =
    !!ownerId && (game.now_playing ?? []).some((e) => e.user_id === ownerId);
  const hasCompleted =
    !!ownerId && (game.completions ?? []).some((e) => e.user_id === ownerId);
  const canWriteReview = isPlaying || hasCompleted;
  const isAdmin = isAdminOrAbove(session?.membership);
  // Thread link and unlink: the API's Regulars-or-staff gate.
  const canEditThreads = isRegularOrStaff(session?.membership);
  // Refresh release info needs an IGDB link and the API's member gate.
  const canRefreshReleases =
    game.igdb_id != null && isMemberOrStaff(session?.membership);

  const releaseDate = game.initial_release_date
    ? new Date(game.initial_release_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  const stats = [
    { label: "Playing", value: players.length },
    { label: "Completed", value: completers.length },
    ...(reviewTotal !== null ? [{ label: "Reviews", value: reviewTotal }] : []),
  ];

  return (
    <div className="pb-8">
      <GameHero game={game} stats={stats} releaseDate={releaseDate} />

      {/* The current round's ballot, when this game is on it. Streams in
          separately — it is a live read and must not hold up the hero. */}
      <Suspense fallback={null}>
        <BallotSection gameId={gameId} />
      </Suspense>

      <div className="mt-7.5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_21.25rem]">
        <section aria-labelledby="game-reviews" className="min-w-0">
          <SectionHeading
            title={<span id="game-reviews">Reviews</span>}
            count={
              reviewTotal
                ? `${reviewTotal} ${reviewTotal === 1 ? "review" : "reviews"}`
                : undefined
            }
            action={
              reviewTotal ? (
                <Link
                  href={`/games/${gameId}/reviews`}
                  className={headingLinkClass}
                >
                  {reviewTotal === 1 ? "The review" : `All ${reviewTotal} reviews`}
                  <ArrowRight aria-hidden />
                </Link>
              ) : undefined
            }
            className="mb-4"
          />
          {reviewTotal === null ? (
            <p className="rounded-md border border-dashed border-rule-strong px-4 py-8 text-center text-sm text-paper-mute">
              Reviews couldn&apos;t be loaded right now.
            </p>
          ) : (
            <GameReviewsList
              gameId={gameId}
              reviews={reviews}
              limit={REVIEWS_SHOWN}
              ownerId={ownerId}
              canWriteReview={canWriteReview}
              viewerStatus={
                isPlaying ? "playing" : hasCompleted ? "completed" : null
              }
              layout="crew"
              accent={accentForGame(game)}
            />
          )}
        </section>

        <aside aria-label="About this game" className="space-y-6.5">
          {/* Saved HowLongToBeat times, or the lookup. Never scrapes on view. */}
          <Suspense fallback={<GameHltbSkeleton />}>
            <GameHltb
              gameId={gameId}
              title={game.title}
              releaseDate={game.initial_release_date}
            />
          </Suspense>
          <RailMembers
            title="Playing now"
            users={players}
            empty="No one is playing this right now."
          />
          <RailMembers
            title="Completed by"
            users={completers}
            empty="No one has finished it yet."
          />
          <Suspense fallback={<RailDetailsSkeleton />}>
            <GameDetails
              gameId={gameId}
              releaseDate={game.initial_release_date}
              canRefreshReleases={canRefreshReleases}
            />
          </Suspense>
          <Suspense fallback={null}>
            <GameThreads gameId={gameId} canEdit={canEditThreads} />
          </Suspense>
          {isAdmin && (
            <section>
              <RailHeading title="Images" count="Admin" />
              <p className="mb-3 text-[0.82rem] text-paper-mute">
                Upload a cover, key art or logo for this game.
              </p>
              <GameImageUploadForm gameId={gameId} />
            </section>
          )}
        </aside>
      </div>

      {/* Members' Game Journals on this game: one chapter line per member. */}
      <Suspense fallback={null}>
        <GameJournalSection
          gameId={gameId}
          completions={game.completions ?? []}
          viewerId={ownerId}
        />
      </Suspense>

      {/* The game's Achievement Sets, only when it has any. */}
      <Suspense fallback={null}>
        <GameAchievements
          gameId={gameId}
          coverUrl={game.cover_url}
          viewerId={ownerId}
          ach={ach}
          achSet={achSet}
        />
      </Suspense>

      <Suspense fallback={null}>
        <AlternateVersions gameId={gameId} canLink={isAdmin} />
      </Suspense>
    </div>
  );
}

// Offers the vote from the game's own page, so a member who landed here from
// a link or a search doesn't have to go find the card on /voting. A game can
// in principle sit on both categories' ballots, so this renders one strip per
// category it appears on.
async function BallotSection({ gameId }: { gameId: number }) {
  const round = await fetchVotingRound();
  // Before a round's vote opens its ballot is withheld — /voting won't show
  // it either, and nothing here should leak what was nominated.
  if (!round || !ballotIsPublic(round)) return null;

  // getSession is React-cached, so this reuses the hero's fetch.
  const session = await getSession();
  const panels = (
    await Promise.all(
      VOTING_CATEGORIES.map((category) =>
        ballotPanel(category, gameId, round, session?.principal.id),
      ),
    )
  ).filter((panel) => panel !== null);

  if (!panels.length) return null;

  return (
    <div className="mt-1.5 space-y-3">
      {panels.map((panel) => (
        <GameBallotPanel key={panel.category} {...panel} />
      ))}
    </div>
  );
}

async function ballotPanel(
  category: VotingCategory,
  gameId: number,
  voting: VotingRound,
  userId: string | undefined,
): Promise<GameBallotPanelProps | null> {
  const round = voting.round_number;
  const nominations = await fetchNominations(category, round);
  // Two members can nominate the same game in one round, so this is a list.
  const forGame = nominations.filter((n) => n.gamedb_game_id === gameId);
  if (!forGame.length) return null;

  const [tally, userVotes] = await Promise.all([
    fetchTally(category, round),
    voting.voting_open && userId
      ? fetchUserVotes(category, round, userId)
      : Promise.resolve([]),
  ]);

  const byGame = tallyByGame(tally.rows);
  const count = byGame.get(gameId) ?? 0;
  const maxCount = Math.max(0, ...byGame.values());

  const votedOn = userVotes.find((vote) => vote.gamedb_game_id === gameId);
  const earliest = forGame.reduce((a, b) =>
    a.nominated_at <= b.nominated_at ? a : b,
  );

  return {
    category,
    categoryTitle: VOTING_CATEGORY_TITLE[category],
    accent: accentForCategory[category],
    round,
    nominationId: votedOn?.nomination_id ?? earliest.nomination_id,
    count,
    maxCount,
    voted: votedOn !== undefined,
    votesUsed: userVotes.length,
    cap: tally.cap,
    votingOpen: voting.voting_open,
    // A shared lead is a tie for the admins to break, not a win yet.
    isWinner:
      voting.voting_ended &&
      voting.phase !== "tie" &&
      maxCount > 0 &&
      count === maxCount,
    nominatedBy: forGame.map(
      (n) => n.user?.global_name ?? n.user?.username ?? "Unknown member",
    ),
    signedIn: userId !== undefined,
  };
}

function joinNames(items: { name: string }[]): string | null {
  return items.length ? items.map((i) => i.name).join(", ") : null;
}

async function GameDetails({
  gameId,
  releaseDate,
  canRefreshReleases,
}: {
  gameId: number;
  releaseDate: string | null;
  canRefreshReleases: boolean;
}) {
  const relations = await fetchRelations(gameId);

  const facts: { label: string; value: React.ReactNode }[] = [];
  if (releaseDate) {
    facts.push({
      label: "Released",
      value: new Date(releaseDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    });
  }
  if (relations) {
    const rows: [string, string | null][] = [
      ["Genres", joinNames(relations.genres)],
      ["Themes", joinNames(relations.themes)],
      ["Game modes", joinNames(relations.modes)],
      ["Perspectives", joinNames(relations.perspectives)],
      [
        "Platforms",
        relations.platforms.length
          ? relations.platforms.map((p) => p.platform_name).join(", ")
          : null,
      ],
      ["Franchises", joinNames(relations.franchises)],
    ];
    for (const [label, value] of rows) {
      if (value) facts.push({ label, value });
    }
    if (relations.companies.length > 0) {
      facts.push({
        label: "Companies",
        value: (
          <ul>
            {relations.companies.map((c) => (
              <li key={c.company_id}>
                {c.name}
                {c.role && (
                  <small className="text-paper-mute"> · {c.role}</small>
                )}
              </li>
            ))}
          </ul>
        ),
      });
    }
  }

  return (
    <RailFacts facts={facts}>
      {canRefreshReleases && <RefreshReleasesButton gameId={gameId} />}
    </RailFacts>
  );
}

// The Achievement showcase: one composite page per Achievement Set, behind
// Provider tabs (only the Providers with a set). Each page rings every
// Achievement with the members who hold it and signs its Completions in the
// margin. A game without sets (or a read that fails) shows nothing, so the
// page doesn't apologise for it.
async function GameAchievements({
  gameId,
  coverUrl,
  viewerId,
  ach,
  achSet,
}: {
  gameId: number;
  coverUrl: string | null;
  viewerId: string | null;
  ach?: string;
  achSet?: string;
}) {
  let sets: GameAchievementSet[];
  try {
    const res = await apiFetch(`/api/v1/games/${gameId}/achievement_sets`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body: { data?: GameAchievementSet[] } = await res.json();
    sets = (body.data ?? []).map((set) => ({
      ...set,
      achievements: set.achievements ?? [],
    }));
  } catch {
    return null;
  }
  const tabs = groupSetsByProvider(sets);
  const initial = pickInitialTab(tabs, ach, achSet);
  if (!initial) return null;

  const [names, tints] = await Promise.all([
    fetchMemberNames(),
    Promise.all(
      sets.map((set) =>
        getSetTint({ coverUrl, iconUrl: set.icon_url, setId: set.id }),
      ),
    ),
  ]);
  const tintOf = new Map(sets.map((set, i) => [set.id, tints[i]]));

  return (
    <section aria-labelledby="game-achievements" className="mt-10">
      <SectionHeading
        title={<span id="game-achievements">Achievements</span>}
        count={`${sets.length} ${sets.length === 1 ? "set" : "sets"}`}
        className="mb-5"
      />
      <GameAchievementTabs
        initialProvider={initial.provider}
        initialSetId={initial.setId}
        tabs={tabs.map((tab) => ({
          provider: tab.provider,
          sets: tab.sets.map((set) => ({
            id: set.id,
            label: setSwitchLabel(set, tab.sets),
            page: (
              <ClubSetPage
                set={set}
                tint={tintOf.get(set.id)!}
                names={names}
                viewerId={viewerId}
              />
            ),
          })),
        }))}
      />
    </section>
  );
}

// user_id -> display name for the ring's members, from the cached member
// directory. Empty when it can't be read: names then fall back to the
// Completions' users.
async function fetchMemberNames(): Promise<Map<string, string>> {
  try {
    const res = await apiFetch(`/api/v1/users?per=500`, {
      next: { revalidate: MEMBERS_REVALIDATE_SECONDS, tags: ["members"] },
    });
    if (!res.ok) return new Map();
    const { data }: ApiCollection<UserSummary> = await res.json();
    return new Map(data.map((user) => [user.user_id, memberName(user)]));
  } catch {
    return new Map();
  }
}

// Admins also get "Link a version" here, so the section shows for them even
// before the game has any.
async function AlternateVersions({
  gameId,
  canLink,
}: {
  gameId: number;
  canLink: boolean;
}) {
  const relations = await fetchRelations(gameId);
  const alternates = relations?.alternates ?? [];
  if (alternates.length === 0 && !canLink) return null;

  return (
    <section aria-labelledby="alternate-versions" className="mt-10">
      <SectionHeading
        title={<span id="alternate-versions">Alternate versions</span>}
        count={
          alternates.length
            ? `${alternates.length} ${alternates.length === 1 ? "version" : "versions"}`
            : undefined
        }
        className="mb-4"
      />
      {alternates.length === 0 && (
        <p className="text-sm text-paper-mute">
          No other version of this game is linked yet.
        </p>
      )}
      <ul className="flex flex-wrap gap-2 empty:hidden">
        {alternates.map((alt) => (
          <li key={alt.game_id}>
            <Link
              href={`/games/${alt.game_id}`}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-auto min-h-9 py-1.5 text-left whitespace-normal",
              )}
            >
              {alt.title}
            </Link>
          </li>
        ))}
      </ul>
      {canLink && (
        <LinkVersionForm
          gameId={gameId}
          alternateIds={alternates.map((alt) => alt.game_id)}
        />
      )}
    </section>
  );
}

function RailDetailsSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-7 w-28 rounded-sm" />
      {Array.from({ length: 5 }, (_, i) => (
        <Skeleton key={i} className="h-4 w-full rounded-sm" />
      ))}
    </div>
  );
}

function GameContentSkeleton() {
  return (
    <div className="pb-8">
      <Skeleton className="-mx-4 -mt-6 h-[420px] rounded-none sm:-mx-7" />
      <div className="mt-7.5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_21.25rem]">
        <div className="space-y-4">
          <Skeleton className="h-10 w-56 rounded-sm" />
          <Skeleton className="h-18 w-full rounded-md" />
          <Skeleton className="h-72 w-full rounded-md" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-20 w-full rounded-sm" />
          <Skeleton className="h-20 w-full rounded-sm" />
          <RailDetailsSkeleton />
        </div>
      </div>
    </div>
  );
}
