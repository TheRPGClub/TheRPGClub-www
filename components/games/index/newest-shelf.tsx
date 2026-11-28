import { ArrowRight } from "lucide-react";
import { fetchGames, NEWEST_SIZE } from "@/lib/games/games-index";
import { BrowseGameCard } from "@/components/issue/browse-game-card";
import {
  SectionHeading,
  headingLinkClass,
} from "@/components/templates/page-header";

// The latest additions to the GameDB as one scrolling shelf of covers. An
// extra over the full grid: a failed or empty read leaves it out.
export async function NewestShelf() {
  const result = await fetchGames({ sort: "newest", per: NEWEST_SIZE });
  if (!result || result.games.length === 0) return null;
  return (
    <section data-slot="games-newest" aria-labelledby="games-newest" className="space-y-4">
      <SectionHeading
        title={<span id="games-newest">Newest in GameDB</span>}
        count="Latest additions"
        action={
          <a href="#games-grid" className={headingLinkClass}>
            Browse all <ArrowRight aria-hidden />
          </a>
        }
      />
      <ul className="-mx-4 flex snap-x overflow-x-auto scroll-px-4 px-4 pt-2.5 pb-3 [scrollbar-color:var(--color-border-strong)_transparent] sm:-mx-0.5 sm:scroll-px-0.5 sm:px-0.5 xl:gap-4.5">
        {result.games.map((game) => (
          <li
            key={game.game_id}
            // The trailing padding is the gap, and room for a winner's stamp,
            // which overhangs the cover's corner.
            className="w-[44vw] max-w-48 shrink-0 snap-start pr-3.5 sm:w-44 xl:w-49 xl:pr-4.5"
          >
            <BrowseGameCard game={game} />
          </li>
        ))}
      </ul>
    </section>
  );
}
