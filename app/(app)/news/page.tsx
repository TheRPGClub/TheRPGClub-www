import Link from "next/link";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getSession, requireFeature } from "@/lib/session";
import { fetchNews, fetchNewsCategories, fetchNewsNeighbours } from "@/lib/api/news";
import { paginationOf } from "@/lib/api/pagination";
import {
  countNote,
  dayHeading,
  dayRunsOver,
  groupNewsByDay,
  hasNewsFilters,
  newsCategoryRows,
  newsEmptyNote,
  newsHref,
  parseNewsFilters,
  type NewsCategory,
  type NewsDay,
  type NewsFilters,
} from "@/lib/news";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { PageHeader } from "@/components/issue/page-header";
import { ListPagination } from "@/components/list-pagination";
import { NewsCard } from "@/components/news/news-card";
import { NewsCategoryRail } from "@/components/news/news-category-rail";
import { Skeleton } from "@/components/ui/skeleton";

// The News Hub (spec api#355): the game news members post in the News
// Category threads on Discord, as a contact sheet. Newest first in UTC day
// bands, each a grid of cards marked in their News Category's ink, beside the
// category rail (a "Filter" disclosure below lg). The URL holds the chosen
// News Categories, the search and the page; the API applies them.

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Gate here, outside the Suspense boundary: a not-found streamed from
  // inside one would answer 200.
  const session = await getSession();
  if (!session) redirect("/");
  const features = await requireFeature("news_hub");
  const filters = parseNewsFilters(await searchParams);
  const badge = features.preview("news_hub") && <PreviewBadge />;

  return (
    <Suspense fallback={<NewsSkeleton badge={badge} />}>
      <NewsBody filters={filters} userId={session.principal.discord_id} badge={badge} />
    </Suspense>
  );
}

async function NewsBody({
  filters,
  userId,
  badge,
}: {
  filters: NewsFilters;
  userId: string;
  badge: React.ReactNode;
}) {
  const [result, categories, neighbours] = await Promise.all([
    fetchNews(filters, userId),
    fetchNewsCategories(),
    fetchNewsNeighbours(filters, userId),
  ]);
  // The flag changed after the gate above ran.
  if (result === "not_found") notFound();

  const items = result?.items ?? [];
  const { total, totalPages } = paginationOf(result?.meta ?? undefined, items.length);
  // An old or hand-edited address past the last page.
  const pastEnd = result !== null && filters.page > totalPages;
  const note = result ? countNote(total, filters.page, totalPages) : null;
  const nameOf = categoryNames(categories);
  const now = new Date();
  const meta = result?.meta;
  // Without the feed the member's switched-off categories are unknown, so
  // the rail shows no counts and claims nothing about them.
  const rows = newsCategoryRows(
    categories,
    filters,
    meta?.category_counts ?? null,
    result ? (meta?.hidden_categories ?? []) : null,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="News"
        badge={badge}
        actions={
          note && (
            <p className="font-label text-sm tracking-[0.08em] text-paper-mute">{note}</p>
          )
        }
      />
      <div className="gap-x-7 lg:grid lg:grid-cols-[15.5rem_minmax(0,1fr)]">
        <NewsCategoryRail rows={rows} filters={filters} />
        <div className="@container min-w-0 space-y-8 max-lg:mt-5">
          {!result ? (
            <EmptyState>Couldn&apos;t load the news. Try again in a moment.</EmptyState>
          ) : items.length === 0 ? (
            <NewsEmpty
              filters={filters}
              lastPage={pastEnd ? totalPages : null}
              nameOf={nameOf}
              // Items the member's default view leaves out (their
              // switched-off categories), for the empty default view.
              elsewhere={Object.values(meta?.category_counts ?? {}).some((n) => n > 0)}
            />
          ) : (
            groupNewsByDay(items).map((day, i, days) => (
              <NewsDayBand
                key={day.day}
                day={day}
                // A day running over a page break shows no tally: this page
                // holds only part of it.
                partial={
                  (i === 0 && dayRunsOver(day.day, neighbours.before)) ||
                  (i === days.length - 1 && dayRunsOver(day.day, neighbours.after))
                }
                now={now}
                nameOf={nameOf}
              />
            ))
          )}
          {/* Past the end, the empty state leads back instead. */}
          {!pastEnd && (
            <ListPagination
              currentPage={filters.page}
              totalPages={totalPages}
              buildHref={(page) => newsHref(filters, { page })}
            />
          )}
          {items.length > 0 && (
            <p className="font-label text-[0.8rem] tracking-[0.08em] text-paper-mute">
              Days and times in UTC
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Display names by key; a key the list didn't load reads as itself.
function categoryNames(categories: NewsCategory[]): (key: string | null) => string {
  const byKey = new Map(categories.map((c) => [c.key as string, c.name]));
  return (key) => {
    if (!key) return "General";
    return byKey.get(key) ?? key.charAt(0).toUpperCase() + key.slice(1);
  };
}

function NewsDayBand({
  day,
  partial,
  now,
  nameOf,
}: {
  day: NewsDay;
  partial: boolean;
  now: Date;
  nameOf: (key: string | null) => string;
}) {
  const heading = dayHeading(day.day, partial ? null : day.items.length, now);
  return (
    <section aria-label={heading.title}>
      <h2 className="mb-3 flex items-baseline gap-3">
        <time dateTime={day.day} className="font-headline shrink-0 text-3xl">
          {heading.title}
        </time>
        {heading.note && (
          <span className="font-label shrink-0 text-[0.8rem] tracking-[0.08em] text-paper-mute">
            {heading.note}
          </span>
        )}
        <span aria-hidden className="h-0.5 min-w-6 flex-1 self-center bg-rule-strong" />
      </h2>
      <ul className="grid gap-5 @xl:grid-cols-2 @3xl:grid-cols-3">
        {day.items.map((item) => (
          <li key={item.message_id} className="min-w-0">
            <NewsCard item={item} categoryName={nameOf(item.category_key)} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function NewsEmpty({
  filters,
  lastPage,
  nameOf,
  elsewhere,
}: {
  filters: NewsFilters;
  // The real last page when the address is past it.
  lastPage: number | null;
  nameOf: (key: string | null) => string;
  elsewhere: boolean;
}) {
  if (filters.page > 1) {
    const back = lastPage ?? 1;
    return (
      <EmptyState>
        Nothing on this page.{" "}
        <Link href={newsHref(filters, { page: back })} className={INLINE_LINK}>
          {back > 1 ? "Back to the last page" : "Back to the first page"}
        </Link>
      </EmptyState>
    );
  }
  if (hasNewsFilters(filters)) {
    return (
      <EmptyState>
        {newsEmptyNote(filters, nameOf, elsewhere)}{" "}
        <Link href={newsHref(filters, { categories: [], q: "" })} className={INLINE_LINK}>
          Clear filters
        </Link>
      </EmptyState>
    );
  }
  if (elsewhere) {
    return (
      <EmptyState>
        Nothing in the News Categories you follow. Choose one in the filter, or turn them
        back on in{" "}
        <Link href="/settings" className={INLINE_LINK}>
          Settings
        </Link>
        .
      </EmptyState>
    );
  }
  return (
    <EmptyState>
      No news yet. It lands here when members post in the News Category threads on Discord.
    </EmptyState>
  );
}

const INLINE_LINK =
  "font-semibold text-paper underline underline-offset-4 transition-colors hover:text-highlight";

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-md border border-dashed border-rule-strong px-4 py-12 text-center text-paper-dim">
      {children}
    </p>
  );
}

function NewsSkeleton({ badge }: { badge: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="News"
        badge={badge}
        actions={<Skeleton className="h-4 w-44 rounded-xs" />}
      />
      <div className="gap-x-7 lg:grid lg:grid-cols-[15.5rem_minmax(0,1fr)]">
        <div className="hidden space-y-2 lg:block">
          <Skeleton className="h-4 w-32 rounded-xs" />
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-[30px] rounded-xs" />
          ))}
        </div>
        <div className="@container min-w-0 space-y-3">
          <Skeleton className="h-9 w-24 rounded-sm lg:hidden" />
          <Skeleton className="h-7 w-56 rounded-xs" />
          <div className="grid gap-5 @xl:grid-cols-2 @3xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-md" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
