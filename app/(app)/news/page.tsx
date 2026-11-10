import Link from "next/link";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getSession, requireFeature } from "@/lib/session";
import { fetchNews, fetchNewsCategories } from "@/lib/api/news";
import { paginationOf } from "@/lib/api/pagination";
import {
  countNote,
  dayHeading,
  groupNewsByDay,
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
// category rail (a "Filter" disclosure below lg). The URL holds the page.

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
      <NewsBody filters={filters} badge={badge} />
    </Suspense>
  );
}

async function NewsBody({
  filters,
  badge,
}: {
  filters: NewsFilters;
  badge: React.ReactNode;
}) {
  const [result, categories] = await Promise.all([fetchNews(filters), fetchNewsCategories()]);
  // The flag changed after the gate above ran.
  if (result === "not_found") notFound();

  const items = result?.items ?? [];
  const { total, totalPages } = paginationOf(result?.meta ?? undefined, items.length);
  const note = result ? countNote(total, filters.page, totalPages) : null;
  const nameOf = categoryNames(categories);
  const now = new Date();

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
        <NewsCategoryRail categories={categories} />
        <div className="@container min-w-0 space-y-8 max-lg:mt-5">
          {!result ? (
            <EmptyState>Couldn&apos;t load the news. Try again in a moment.</EmptyState>
          ) : items.length === 0 ? (
            <NewsEmpty filters={filters} />
          ) : (
            groupNewsByDay(items).map((day) => (
              <NewsDayBand key={day.day} day={day} now={now} nameOf={nameOf} />
            ))
          )}
          <ListPagination
            currentPage={filters.page}
            totalPages={totalPages}
            buildHref={(page) => newsHref(filters, { page })}
          />
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
  now,
  nameOf,
}: {
  day: NewsDay;
  now: Date;
  nameOf: (key: string | null) => string;
}) {
  const heading = dayHeading(day.day, day.items.length, now);
  return (
    <section aria-label={heading.title}>
      <h2 className="mb-3 flex items-baseline gap-3">
        <time dateTime={day.day} className="font-headline shrink-0 text-3xl">
          {heading.title}
        </time>
        <span className="font-label shrink-0 text-[0.8rem] tracking-[0.08em] text-paper-mute">
          {heading.note}
        </span>
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

function NewsEmpty({ filters }: { filters: NewsFilters }) {
  if (filters.page > 1) {
    return (
      <EmptyState>
        Nothing on this page.{" "}
        <Link href={newsHref(filters, { page: 1 })} className={INLINE_LINK}>
          Back to the first page
        </Link>
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
