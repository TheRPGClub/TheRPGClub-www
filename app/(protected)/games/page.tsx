import { Suspense } from "react";
import { requireFeature } from "@/lib/session";
import { fetchGames, numberFormat } from "@/lib/games/games-index";
import { parseWinner } from "@/lib/games/index-href";
import { anyFacet, parseFacets, type FacetKey } from "@/lib/games/index-facets";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { PageHeader } from "@/components/templates/page-header";
import { GamesSearchForm } from "@/components/games/games-search-form";
import { GamesGrid } from "@/components/games/index/games-grid";
import { GamesLead } from "@/components/games/index/games-lead";
import {
  FacetFiltersSkeleton,
  GamesGridSkeleton,
  LeadSkeleton,
  NewestSkeleton,
} from "@/components/games/index/games-index-skeletons";
import { FacetFilters } from "@/components/games/index/facet-filters";
import { NewestShelf } from "@/components/games/index/newest-shelf";
import { WinnerFilter } from "@/components/games/index/winner-filter";

// The club's GameDB as a magazine department. Browsing opens on the latest
// winners as wide key-art cards, then a shelf of the newest additions, over
// the full cover grid; a search or a winner filter drops both and shows the
// grid's results alone, and so does a facet (Genre, Platform, …).

export default async function GamesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; winner?: string } & Partial<Record<FacetKey, string>>>;
}) {
  // The whole GameDB's size for the masthead; a one-row read, cached.
  const [features, params, club] = await Promise.all([
    requireFeature("game_index"),
    searchParams,
    fetchGames({ per: 1 }),
  ]);
  const { q: rawQ = "", page = "1", winner } = params;
  const facets = parseFacets(params);
  // The GOTM lead and winner filter belong to Voting & GOTM.
  const gotm = features.shown("voting_gotm");
  const q = rawQ.trim();
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  // Without Voting & GOTM there's no winner filter to show, so a winner in
  // the URL is ignored rather than narrowing the grid out of sight.
  const winnerFilter = gotm ? parseWinner(winner) : null;
  const browsing = !q && !winnerFilter && !anyFacet(facets);

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
          facets={facets}
          placeholder={clubTotal ? `Search ${clubTotal} games…` : "Search games…"}
        />
        {gotm && <WinnerFilter current={winnerFilter} q={q} facets={facets} />}
      </div>

      <Suspense fallback={<FacetFiltersSkeleton />}>
        <FacetFilters q={q} winner={winnerFilter} facets={facets} />
      </Suspense>

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
        key={`${q}|${winnerFilter ?? ""}|${JSON.stringify(facets)}|${currentPage}`}
        fallback={<GamesGridSkeleton />}
      >
        <GamesGrid
          q={q}
          currentPage={currentPage}
          winner={winnerFilter}
          facets={facets}
          browsing={browsing}
        />
      </Suspense>
    </div>
  );
}
