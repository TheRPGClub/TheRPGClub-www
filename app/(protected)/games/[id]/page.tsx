import { notFound } from "next/navigation";
import { Suspense } from "react";
import { firstParam, gamePageGates, loadGamePage } from "@/lib/games/game-page";
import { viewerOnGame } from "@/lib/games/viewer";
import { accentForGame } from "@/lib/reviews/accent";
import { GameJournalSection } from "@/components/journal/game-journal-section";
import { FeaturedVideo } from "@/components/games/game-page/featured-video";
import { GameAchievements } from "@/components/games/game-page/game-achievements";
import { GameBallotSection } from "@/components/games/game-page/game-ballot-section";
import { GameFactsRow } from "@/components/games/game-page/game-facts-row";
import { GamePageHero } from "@/components/games/game-page/game-page-hero";
import { FactsRowSkeleton, GamePageSkeleton } from "@/components/games/game-page/game-page-skeleton";
import { GameReviewsSection } from "@/components/games/game-page/game-reviews-section";
import { DraftSlot } from "@/components/reviews/drafts/draft-slot";
import { DetailTemplate } from "@/components/templates/detail-template";
import { GameListsSection } from "@/components/game-lists/game/game-lists-section";

// A game's page is its cover story (design www#156, round 3), in a fixed
// order: the hero with the club's panel over its foot (time to beat, who's
// playing it, who finished it, its Discord threads); Releases, Details and
// Alternate Versions; the round it's on the ballot for; its Featured Video;
// then Reviews, the Game Lists it is in, its members' journals and its
// Achievement Sets, full width.

export default function GamePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<GamePageSkeleton />}>
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
  const page = await loadGamePage(gameId);
  if (!page) notFound();
  const { game, session, features, show, reviews, reviewTotal, ownDraft } = page;
  const viewer = viewerOnGame(game, session?.principal.discord_id ?? null);
  const gates = gamePageGates(session?.membership);

  return (
    <DetailTemplate
      className="pb-8"
      hero={<GamePageHero game={game} features={features} show={show} canEdit={gates.canEdit} />}
    >
      <Suspense fallback={<FactsRowSkeleton />}>
        <GameFactsRow game={game} calendarShown={show.releaseCalendar} />
      </Suspense>
      {/* A live read: streams in separately, never holding up the rest. */}
      {show.ballot && (
        <Suspense fallback={null}>
          <GameBallotSection gameId={gameId} />
        </Suspense>
      )}
      <FeaturedVideo game={game} />
      {show.reviews && (
        <GameReviewsSection
          gameId={gameId}
          reviews={reviews}
          reviewTotal={reviewTotal}
          viewer={viewer}
          accent={accentForGame(game)}
          draftSlot={
            ownDraft && (
              <DraftSlot
                draft={ownDraft.draft}
                now={ownDraft.now}
                gameTitle={game.title}
                coverUrl={game.cover_url}
              />
            )
          }
        />
      )}
      {/* In Game Lists, below Reviews (pick 5C): its own read, streamed. */}
      {show.gameLists && (
        <Suspense fallback={null}>
          <GameListsSection gameId={gameId} gameTitle={game.title} viewerId={session?.principal.discord_id ?? null} />
        </Suspense>
      )}
      {/* Members' Game Journals on this game: one chapter line per member.
          Completions join the timeline only when Game Completions shows. */}
      {show.journals && (
        <Suspense fallback={null}>
          <GameJournalSection
            gameId={gameId}
            completions={show.completed ? (game.completions ?? []) : null}
            viewerId={viewer.ownerId}
          />
        </Suspense>
      )}
      {show.achievements && (
        <Suspense fallback={null}>
          <GameAchievements
            gameId={gameId}
            ach={ach}
            achSet={achSet}
          />
        </Suspense>
      )}
    </DetailTemplate>
  );
}
