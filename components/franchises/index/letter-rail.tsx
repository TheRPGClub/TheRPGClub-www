import Link from "next/link";
import { LETTERS, browseHref, type BrowseQuery } from "@/lib/franchises/browse";
import { cn } from "@/lib/utils";

// The letter rail: "#" then A to Z, down the wall's right edge from `lg`
// and across its top (scrolling sideways) below that. A letter narrows the
// wall to names starting with it, under the same sort; it replaces a
// search. The picked letter is a yellow block, and pressing it again shows
// every Franchise.
export function LetterRail({ query }: { query: BrowseQuery }) {
  return (
    <nav
      aria-label="Franchises by letter"
      className="lg:col-start-2 lg:row-start-1"
    >
      <ul className="-mx-1 flex gap-px overflow-x-auto px-1 pb-1 lg:sticky lg:top-6 lg:mx-0 lg:flex-col lg:overflow-visible lg:p-0">
        {LETTERS.map((letter) => {
          const on = query.letter === letter;
          return (
            <li key={letter}>
              <Link
                href={browseHref({
                  sort: query.sort,
                  letter: on ? null : letter,
                })}
                scroll={false}
                aria-current={on ? "true" : undefined}
                aria-label={
                  on
                    ? `${label(letter)}, shown. Show every Franchise`
                    : label(letter)
                }
                className={cn(
                  "font-label grid h-6 min-w-6 place-items-center rounded-xs text-[0.76rem] leading-none font-extrabold transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-highlight",
                  on
                    ? "bg-highlight text-highlight-foreground"
                    : "text-dim-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {letter}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function label(letter: string): string {
  return letter === "#"
    ? "Names not starting with a letter"
    : `Starting with ${letter}`;
}
