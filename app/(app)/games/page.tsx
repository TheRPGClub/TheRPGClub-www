import Link from "next/link";
import { Suspense } from "react";
import { apiFetch } from "@/lib/api";
import type { ApiCollection, Game } from "@/lib/api/types";
import { GamesSearchForm } from "./games-search-form";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

const PAGE_SIZE = 24;
const GAMES_REVALIDATE_SECONDS = 300;

export default async function GamesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q = "", page = "1" } = await searchParams;
  const currentPage = Math.max(1, parseInt(page, 10) || 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Games</h1>
        <GamesSearchForm defaultQuery={q} />
      </div>

      <Suspense fallback={<GamesGridSkeleton />}>
        <GamesGrid q={q} currentPage={currentPage} />
      </Suspense>
    </div>
  );
}

async function GamesGrid({ q, currentPage }: { q: string; currentPage: number }) {
  const offset = (currentPage - 1) * PAGE_SIZE;
  const qs = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(offset) });
  if (q) qs.set("q", q);

  let games: Game[] = [];
  let totalPages = 1;

  try {
    const res = await apiFetch(`/api/v1/games?${qs}`, {
      next: { revalidate: GAMES_REVALIDATE_SECONDS, tags: ["games"] },
    });
    if (res.ok) {
      const body: ApiCollection<Game> = await res.json();
      games = body.data;
      if (body.meta.total !== undefined) {
        totalPages = Math.max(1, Math.ceil(body.meta.total / PAGE_SIZE));
      }
    }
  } catch {
    // render empty state
  }

  const pageHref = (p: number) => {
    const ps = new URLSearchParams();
    if (q) ps.set("q", q);
    if (p > 1) ps.set("page", String(p));
    return `/games${ps.size ? `?${ps}` : ""}`;
  };

  return (
    <>
      {games.length === 0 ? (
        <p className="text-muted-foreground">No games found.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {games.map((game) => (
            <GameCard key={game.game_id} game={game} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            {currentPage > 1 && (
              <PaginationItem>
                <PaginationPrevious href={pageHref(currentPage - 1)} />
              </PaginationItem>
            )}
            {pageWindows(currentPage, totalPages).map((entry, i) =>
              entry === null ? (
                <PaginationItem key={`ellipsis-${i}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={entry}>
                  <PaginationLink href={pageHref(entry)} isActive={entry === currentPage}>
                    {entry}
                  </PaginationLink>
                </PaginationItem>
              )
            )}
            {currentPage < totalPages && (
              <PaginationItem>
                <PaginationNext href={pageHref(currentPage + 1)} />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </>
  );
}

function GamesGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {Array.from({ length: PAGE_SIZE }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="aspect-[3/4] w-full rounded-lg" />
          <Skeleton className="h-3.5 w-3/4" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      ))}
    </div>
  );
}

function pageWindows(current: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | null)[] = [1];
  if (current > 3) pages.push(null);
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    pages.push(p);
  }
  if (current < total - 2) pages.push(null);
  pages.push(total);

  return pages;
}

function GameCard({ game }: { game: Game }) {
  const imageUrl = game.cover_url ?? game.art_url;
  const year = game.initial_release_date
    ? new Date(game.initial_release_date).getFullYear()
    : null;
  return (
    <Link href={`/games/${game.game_id}`} className="group block space-y-2">
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg border bg-muted">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={game.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-2">
            <span className="text-center text-xs text-muted-foreground line-clamp-4">
              {game.title}
            </span>
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium leading-tight line-clamp-2">{game.title}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {year && <span>{year}</span>}
        </div>
      </div>
    </Link>
  );
}
