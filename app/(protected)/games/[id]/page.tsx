import { notFound } from "next/navigation";
import { Suspense } from "react";
import { firstParam, gamePageGates, loadGamePage } from "@/lib/games/game-page";
import { viewerOnGame } from "@/lib/games/viewer";
import { accentForGame } from "@/lib/reviews/accent";
import { GameJournalSection } from "@/components/journal/game-journal-section";
import { AlternateVersions } from "@/components/games/game-page/alternate-versions";
import { GameAboutRail } from "@/components/games/game-page/game-about-rail";
import { GameAchievements } from "@/components/games/game-page/game-achievements";
import { GameBallotSection } from "@/components/games/game-page/game-ballot-section";
import { GameColumns } from "@/components/games/game-page/game-columns";
import { GamePageHero } from "@/components/games/game-page/game-page-hero";
import { GamePageSkeleton } from "@/components/games/game-page/game-page-skeleton";
import { GameReviewsSection } from "@/components/games/game-page/game-reviews-section";
import { DraftSlot } from "@/components/reviews/drafts/draft-slot";
import { DetailTemplate } from "@/components/templates/detail-template";

// A game's page is its cover story: the hero with the club's numbers, the
// round it's on the ballot for, then the reviews beside a rail of who's
// playing it, who finished it and the facts, its members' journals, its
// Achievement Sets, and its other versions last.

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
  const gates = gamePageGates(game, session?.membership);

  return (
    <DetailTemplate
      className="pb-8"
      hero={<GamePageHero game={game} reviewTotal={reviewTotal} features={features} canEdit={gates.canEdit} />}
    >
      {/* A live read: streams in separately, never holding up the hero. */}
      {show.ballot && (
        <Suspense fallback={null}>
          <GameBallotSection gameId={gameId} />
        </Suspense>
      )}
      <GameColumns
        reviews={
          show.reviews && (
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
          )
        }
        rail={<GameAboutRail gameId={gameId} game={game} show={show} gates={gates} />}
      />
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
            coverUrl={game.cover_url}
            viewerId={viewer.ownerId}
            ach={ach}
            achSet={achSet}
          />
        </Suspense>
      )}
      <Suspense fallback={null}>
        <AlternateVersions gameId={gameId} canLink={gates.isAdmin} />
      </Suspense>
    </DetailTemplate>
  );
}
