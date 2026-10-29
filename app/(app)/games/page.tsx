import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { ApiCollection, Game } from "@/lib/api/types";
import { paginationOf } from "@/lib/api/pagination";
import { fetchGotmRounds } from "@/lib/api/gotm-rounds";
import { getSession } from "@/lib/session";
import { BrowseGameCard } from "@/components/issue/browse-game-card";
import { BrowseLead, latestWinners } from "@/components/issue/browse-lead";
import {
  PageHeader,
  SectionHeading,
  headingLinkClass,
} from "@/components/issue/page-header";
import { ListPagination } from "@/components/list-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { GamesSearchForm } from "./games-search-form";

// The club's GameDB as a magazine department. Browsing opens on the latest
// winners as wide key-art cards, then a shelf of the newest additions, over
// the full cover grid; a search or a winner filter drops both and shows the
// grid's results alone.

const PAGE_SIZE = 24;
const NEWEST_SIZE = 12;
const GAMES_REVALIDATE_SECONDS = 300;

type WinnerFilter = "gotm" | "nr_gotm" | null;

function parseWinner(value: string | undefined): WinnerFilter {
  return value === "gotm" || value === "nr_gotm" ? value : null;
}

const numberFormat = new Intl.NumberFormat("en-US");

interface GamesResult {
  games: Game[];
  total: number;
  totalPages: number;
}

// null when the read failed, so the page can tell an outage from no matches.
async function fetchGames({
  q = "",
  winner = null,
  page = 1,
  per = PAGE_SIZE,
  sort = "title",
}: {
  q?: string;
  winner?: WinnerFilter;
  page?: number;
  per?: number;
  // "newest" is most recently added to the GameDB; the API ignores it
  // alongside a search.
  sort?: "title" | "newest";
}): Promise<GamesResult | null> {
  const qs = new URLSearchParams({ per: String(per), page: String(page) });
  if (q) qs.set("q", q);
  if (winner) qs.set("winner", winner);
  if (sort !== "title") qs.set("sort", sort);
  try {
    const res = await apiFetch(`/api/v1/games?${qs}`, {
      next: { revalidate: GAMES_REVALIDATE_SECONDS, tags: ["games"] },
    });
    if (!res.ok) return null;
    const body: ApiCollection<Game> = await res.json();
    // The server paginates and clamps the page size; take its counts rather
    // than recomputing them.
    const { total, totalPages } = paginationOf(body.meta, body.data.length);
    return { games: body.data, total, totalPages };
  } catch {
    return null;
  }
}

export default async function GamesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; winner?: string }>;
}) {
  const { q: rawQ = "", page = "1", winner } = await searchParams;
  const q = rawQ.trim();
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const winnerFilter = parseWinner(winner);
  const browsing = !q && !winnerFilter;

  // The whole GameDB's size for the masthead; a one-row read, cached.
  const club = await fetchGames({ per: 1 });
  const clubTotal = club ? numberFormat.format(club.total) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Games"
        count={clubTotal ? `${clubTotal} in the club's GameDB` : undefined}
      />

      <div className="flex flex-wrap items-center gap-2.5">
        <GamesSearchForm
          defaultQuery={q}
          winner={winnerFilter}
          placeholder={clubTotal ? `Search ${clubTotal} games…` : "Search games…"}
        />
        <WinnerFilter current={winnerFilter} q={q} />
      </div>

      {browsing && currentPage === 1 && (
        <>
          <Suspense fallback={<LeadSkeleton />}>
            <Lead />
          </Suspense>
          <Suspense fallback={<NewestSkeleton />}>
            <Newest />
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

async function Lead() {
  // The GOTM history read needs auth; skip it rather than make a fetch that
  // can only 401 (see lib/api/gotm-rounds.ts).
  if (!(await getSession())) return null;
  const history = await fetchGotmRounds({
    kind: "both",
    year: null,
    q: "",
    sort: "desc",
    page: 1,
  });
  return <BrowseLead picks={latestWinners(history?.rounds ?? [])} />;
}

// The latest additions to the GameDB as one scrolling shelf of covers. An
// extra over the full grid: a failed or empty read leaves it out.
async function Newest() {
  const result = await fetchGames({ sort: "newest", per: NEWEST_SIZE });
  if (!result || result.games.length === 0) return null;
  return (
    <section aria-labelledby="games-newest" className="space-y-4">
      <SectionHeading
        title={<span id="games-newest">Newest in GameDB</span>}
        count="Latest additions"
        action={
          <a href="#games-grid" className={headingLinkClass}>
            Browse all <ArrowRight aria-hidden />
          </a>
        }
      />
      <ul className="-mx-4 flex snap-x overflow-x-auto scroll-px-4 px-4 pt-2.5 pb-3 [scrollbar-color:var(--color-rule-strong)_transparent] sm:-mx-0.5 sm:scroll-px-0.5 sm:px-0.5 xl:gap-4.5">
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

const WINNER_LABEL: Record<"gotm" | "nr_gotm", string> = {
  gotm: "GOTM winners",
  nr_gotm: "NR-GOTM winners",
};

async function GamesGrid({
  q,
  currentPage,
  winner,
  browsing,
}: {
  q: string;
  currentPage: number;
  winner: WinnerFilter;
  browsing: boolean;
}) {
  const result = await fetchGames({ q, winner, page: currentPage });
  const games = result?.games ?? [];
  const total = result?.total ?? 0;

  const pageHref = (p: number) => {
    const ps = new URLSearchParams();
    if (q) ps.set("q", q);
    if (winner) ps.set("winner", winner);
    if (p > 1) ps.set("page", String(p));
    return `/games${ps.size ? `?${ps}` : ""}`;
  };

  const title = q
    ? `Results for “${q}”`
    : winner
      ? WINNER_LABEL[winner]
      : "All games";
  const count = result
    ? `${numberFormat.format(total)} ${total === 1 ? "game" : "games"}${
        q && winner ? ` · ${WINNER_LABEL[winner]}` : ""
      }`
    : undefined;

  return (
    <section aria-labelledby="games-grid" className="space-y-5">
      <SectionHeading
        title={<span id="games-grid">{title}</span>}
        count={count}
        className={cn(!browsing && "mt-2")}
      />

      {!result ? (
        <EmptyState>Couldn&apos;t load the GameDB. Try again in a moment.</EmptyState>
      ) : games.length === 0 ? (
        <EmptyState>
          {q
            ? `No games match “${q}”${winner ? ` among ${WINNER_LABEL[winner]}` : ""}.`
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
        buildHref={pageHref}
      />
    </section>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-md border border-dashed border-rule-strong px-4 py-12 text-center text-paper-dim">
      {children}
    </p>
  );
}

// All / GOTM winners / NR winners. A segmented control of links, so each
// filter is a URL; switching keeps the search and starts from page one.
function WinnerFilter({ current, q }: { current: WinnerFilter; q: string }) {
  const options: { value: WinnerFilter; label: string; dot?: string }[] = [
    { value: null, label: "All" },
    { value: "gotm", label: "GOTM winners", dot: "bg-gotm" },
    { value: "nr_gotm", label: "NR winners", dot: "bg-nr" },
  ];

  const href = (value: WinnerFilter) => {
    const ps = new URLSearchParams();
    if (q) ps.set("q", q);
    if (value) ps.set("winner", value);
    return `/games${ps.size ? `?${ps}` : ""}`;
  };

  return (
    <nav
      aria-label="Filter by winners"
      className="flex w-full overflow-hidden rounded-sm border border-rule-strong sm:w-auto"
    >
      {options.map((option) => {
        const active = option.value === current;
        return (
          <Link
            key={option.value ?? "all"}
            href={href(option.value)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "font-label inline-flex h-11 flex-1 items-center justify-center gap-2 border-l border-rule-strong px-2.5 text-[0.82rem] font-extrabold tracking-[0.06em] whitespace-nowrap transition-colors first:border-l-0 sm:flex-none sm:px-3.5 sm:text-[0.92rem]",
              active
                ? "bg-paper text-ink"
                : "text-paper-dim hover:bg-ink-3 hover:text-paper",
            )}
          >
            {option.dot && (
              <span
                aria-hidden
                className={cn("size-2.25 rounded-full", option.dot)}
              />
            )}
            {option.label}
          </Link>
        );
      })}
    </nav>
  );
}

function LeadSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-1.5 md:grid-cols-[1.5fr_1fr_1fr]">
      <Skeleton className="col-span-2 h-60 rounded-none md:col-span-1 md:h-75" />
      <Skeleton className="h-50 rounded-none md:h-75" />
      <Skeleton className="h-50 rounded-none md:h-75" />
    </div>
  );
}

function NewestSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-64 rounded-sm" />
      <div className="flex gap-3.5 overflow-hidden pt-2.5 xl:gap-4.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton
            key={i}
            className="aspect-[3/4] w-[42vw] max-w-44 shrink-0 rounded-sm sm:w-40 xl:w-44"
          />
        ))}
      </div>
    </div>
  );
}

function GamesGridSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-10 w-64 rounded-sm" />
      <div className="grid grid-cols-2 gap-x-3.5 gap-y-5 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 xl:gap-x-4.5 xl:gap-y-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-[3/4] w-full rounded-sm" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
