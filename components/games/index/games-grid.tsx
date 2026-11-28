import type { ReactNode } from "react";
import { getSession } from "@/lib/session";
import { igdbAddBlockedReason } from "@/lib/igdb";
import {
  fetchGames,
  numberFormat,
  WINNER_LABEL,
} from "@/lib/games/games-index";
import { gamesIndexHref, type WinnerFilter } from "@/lib/games/index-href";
import { anyFacet, type Facets } from "@/lib/games/index-facets";
import { cn } from "@/lib/utils";
import { BrowseGameCard } from "@/components/issue/browse-game-card";
import { ListPagination } from "@/components/list-pagination";
import { IgdbFallback } from "@/components/igdb/igdb-fallback";
import { SectionHeading } from "@/components/templates/page-header";

// The full cover grid: every game, a search's results or the filters', a
// page at a time. A plain search the GameDB has no match for offers adding
// the game from IGDB.
export async function GamesGrid({
  q,
  currentPage,
  winner,
  facets,
  browsing,
}: {
  q: string;
  currentPage: number;
  winner: WinnerFilter;
  facets: Facets;
  browsing: boolean;
}) {
  const result = await fetchGames({ q, winner, facets, page: currentPage });
  const faceted = anyFacet(facets);
  const games = result?.games ?? [];
  const total = result?.total ?? 0;
  const offerIgdb = !!result && games.length === 0 && !!q && !winner && !faceted;
  const session = offerIgdb ? await getSession() : null;
  const igdbBlocked = offerIgdb
    ? igdbAddBlockedReason(!!session, session?.membership)
    : null;

  const title = q
    ? `Results for “${q}”`
    : winner
      ? WINNER_LABEL[winner]
      : faceted
        ? "Filtered games"
        : "All games";
  const count = result
    ? `${numberFormat.format(total)} ${total === 1 ? "game" : "games"}${
        q && winner ? ` · ${WINNER_LABEL[winner]}` : ""
      }`
    : undefined;

  return (
    <section data-slot="games-grid" aria-labelledby="games-grid" className="space-y-5">
      <SectionHeading
        title={<span id="games-grid">{title}</span>}
        count={count}
        className={cn(!browsing && "mt-2")}
      />

      {!result ? (
        <EmptyState>Couldn&apos;t load the GameDB. Try again in a moment.</EmptyState>
      ) : offerIgdb ? (
        <IgdbFallback
          key={q}
          query={q}
          variant="page"
          blockedReason={igdbBlocked}
        />
      ) : games.length === 0 ? (
        <EmptyState>
          {q
            ? `No games match “${q}”${winner ? ` among ${WINNER_LABEL[winner]}` : ""}${faceted ? " with these filters" : ""}.`
            : winner || faceted
              ? "No games match these filters."
              : "No games here yet."}
        </EmptyState>
      ) : (
        <ul className="grid grid-cols-2 gap-x-3.5 gap-y-5 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 xl:gap-x-4.5 xl:gap-y-6">
          {games.map((game) => (
            <li key={game.game_id}>
              <BrowseGameCard game={game} />
            </li>
          ))}
        </ul>
      )}

      <ListPagination
        currentPage={currentPage}
        totalPages={result?.totalPages ?? 1}
        buildHref={(page) => gamesIndexHref({ q, winner, facets, page })}
      />
    </section>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p data-slot="shelf-empty" className="rounded-md border border-dashed border-border-strong px-4 py-12 text-center text-dim-foreground">
      {children}
    </p>
  );
}
