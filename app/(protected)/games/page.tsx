import { Suspense } from "react";
import { requireFeature } from "@/lib/session";
import { fetchGames, numberFormat } from "@/lib/games/games-index";
import { parseWinner } from "@/lib/games/index-href";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { PageHeader } from "@/components/templates/page-header";
import { GamesSearchForm } from "@/components/games/games-search-form";
import { GamesGrid } from "@/components/games/index/games-grid";
import { GamesLead } from "@/components/games/index/games-lead";
import {
  GamesGridSkeleton,
  LeadSkeleton,
  NewestSkeleton,
} from "@/components/games/index/games-index-skeletons";
import { NewestShelf } from "@/components/games/index/newest-shelf";
import { WinnerFilter } from "@/components/games/index/winner-filter";

// The club's GameDB as a magazine department. Browsing opens on the latest
// winners as wide key-art cards, then a shelf of the newest additions, over
// the full cover grid; a search or a winner filter drops both and shows the
// grid's results alone.

export default async function GamesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; winner?: string }>;
}) {
  // The whole GameDB's size for the masthead; a one-row read, cached.
  const [features, { q: rawQ = "", page = "1", winner }, club] = await Promise.all([
    requireFeature("game_index"),
    searchParams,
    fetchGames({ per: 1 }),
  ]);
  // The GOTM lead and winner filter belong to Voting & GOTM.
  const gotm = features.shown("voting_gotm");
  const q = rawQ.trim();
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  // Without Voting & GOTM there's no winner filter to show, so a winner in
  // the URL is ignored rather than narrowing the grid out of sight.
  const winnerFilter = gotm ? parseWinner(winner) : null;
  const browsing = !q && !winnerFilter;

  const clubTotal = club ? numberFormat.format(club.total) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Games"
        badge={features.preview("game_index") && <PreviewBadge />}
        count={clubTotal ? `${clubTotal} in the club's GameDB` : undefined}
      />

      <div className="flex flex-wrap items-center gap-2.5">
        <GamesSearchForm
          defaultQuery={q}
          winner={winnerFilter}
          placeholder={clubTotal ? `Search ${clubTotal} games…` : "Search games…"}
        />
        {gotm && <WinnerFilter current={winnerFilter} q={q} />}
      </div>

      {browsing && currentPage === 1 && (
        <>
          {gotm && (
            <Suspense fallback={<LeadSkeleton />}>
              <GamesLead />
            </Suspense>
          )}
          <Suspense fallback={<NewestSkeleton />}>
            <NewestShelf />
          </Suspense>
        </>
      )}

      <Suspense
        key={`${q}|${winnerFilter ?? ""}|${currentPage}`}
        fallback={<GamesGridSkeleton />}
      >
        <GamesGrid
          q={q}
          currentPage={currentPage}
          winner={winnerFilter}
          browsing={browsing}
        />
      </Suspense>
    </div>
  );
}
