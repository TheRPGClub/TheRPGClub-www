import Link from "next/link";
import type { GameList, GameListGame } from "@/lib/game-lists/types";
import { CoverDeck } from "@/components/game-lists/cover-deck";
import { ListMeta } from "@/components/game-lists/list-byline";
import { SearchHit, type ListHit } from "@/components/game-lists/search-hit";

// One of the club's lists on the index (pick 1A's feature panel): the cover
// deck, the name in Anton with its description, and the monumental count.
// The whole panel opens the list (the name's link, stretched); the owner
// opens their profile.
export function ClubListPanel({
  list,
  covers,
  hit,
}: {
  list: GameList;
  // Up to five covers in the list's order (the preview's four otherwise).
  covers: readonly GameListGame[];
  hit?: ListHit | null;
}) {
  return (
    <article
      className="group relative grid grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-4 rounded-md bg-card p-4 transition-colors hover:bg-muted sm:grid-cols-[11rem_minmax(0,1fr)_auto] sm:gap-5 sm:px-5 sm:py-5"
    >
      <CoverDeck games={covers} className="max-sm:w-[11rem] max-sm:origin-bottom-left max-sm:scale-[0.58]" />
      <div className="min-w-0">
        <h3 className="font-headline text-2xl leading-[0.92] text-balance transition-colors group-hover:text-highlight sm:text-[1.9rem]">
          <Link
            href={`/lists/${list.id}`}
            className="outline-none after:absolute after:inset-0 after:rounded-md after:content-[''] focus-visible:after:outline-2 focus-visible:after:outline-highlight"
          >
            {list.name}
          </Link>
        </h3>
        {list.description && (
          <p className="mt-1.5 line-clamp-2 text-[0.92rem] leading-snug text-dim-foreground">{list.description}</p>
        )}
        <ListMeta list={list} className="mt-2.5" />
        {hit && <SearchHit hit={hit} />}
        <p className="font-label mt-2 text-[0.78rem] font-bold tracking-[0.07em] text-faint-foreground sm:hidden">
          {list.entry_count} games
        </p>
      </div>
      <p className="font-headline hidden text-right text-[4rem] leading-[0.8] sm:block">
        {list.entry_count}
        <small className="font-label mt-1.5 block text-[0.74rem] font-bold tracking-[0.08em] text-faint-foreground">
          games
        </small>
      </p>
    </article>
  );
}
