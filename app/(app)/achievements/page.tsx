import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getSession } from "@/lib/session";
import {
  FEED_VIEW_OPTIONS,
  fetchAchievementFeed,
  feedHref,
  groupFeedByDay,
  hasFeedFilters,
  parseFeedFilters,
  type AchievementFeedFilters as Filters,
} from "@/lib/api/achievement-feed";
import { paginationOf } from "@/lib/api/pagination";
import type { AchievementFeedCard, AchievementProvider } from "@/lib/api/types";
import { PROVIDER_LABEL, formatFeedDay } from "@/lib/achievements";
import { FeedCard } from "@/components/achievements/feed-card";
import { PageHeader } from "@/components/issue/page-header";
import { ListPagination } from "@/components/list-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// The community hub: every member's Unlocks across the club, newest first.
// "Latest" groups a member's Unlocks per Achievement Set and UTC day;
// "Highlights" shows each Platinum, Mastery, Completion and ultra-rare
// Unlock on its own card. Both run under day rules and narrow by Provider.

export default async function AchievementsHubPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseFeedFilters(await searchParams);

  return (
    <Suspense fallback={<HubSkeleton />}>
      <AchievementsHub filters={filters} />
    </Suspense>
  );
}

async function AchievementsHub({ filters }: { filters: Filters }) {
  // The feed needs auth; confirm a session before a fetch that can only 401.
  const session = await getSession();
  if (!session) redirect("/");

  const result = await fetchAchievementFeed(filters);
  const cards = result?.cards ?? [];
  const { total, totalPages } = paginationOf(
    result?.meta ?? undefined,
    cards.length,
  );
  const editHref = `/members/${session.principal.discord_id}/edit`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Achievements"
        count={
          result && filters.view === "highlights" && total > 0
            ? `${total} ${total === 1 ? "Highlight" : "Highlights"}`
            : undefined
        }
        description="Every Unlock across the club's Linked Accounts, newest first."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <ViewTabs filters={filters} />
        <ProviderFilter filters={filters} />
      </div>

      {!result ? (
        <EmptyState>
          Couldn&apos;t load the achievements. Try again in a moment.
        </EmptyState>
      ) : cards.length === 0 ? (
        <FeedEmpty filters={filters} editHref={editHref} />
      ) : (
        <FeedDays cards={cards} />
      )}

      <ListPagination
        currentPage={filters.page}
        totalPages={totalPages}
        buildHref={(page) => feedHref(filters, { page })}
      />
    </div>
  );
}

function FeedDays({ cards }: { cards: AchievementFeedCard[] }) {
  return (
    <div className="space-y-8">
      {groupFeedByDay(cards).map(({ day, cards: dayCards }) => (
        <section key={day ?? "unknown"} aria-label={dayLabel(day)} className="space-y-3">
          <h2 className="font-label border-b border-rule pb-1.5 text-[0.95rem] font-extrabold tracking-[0.08em] text-paper-dim">
            {day ? <time dateTime={day}>{dayLabel(day)}</time> : dayLabel(day)}
          </h2>
          <ul className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
            {dayCards.map((card) => (
              <li key={cardKey(card)} className="min-w-0">
                <FeedCard card={card} className="h-full" />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function dayLabel(day: string | null): string {
  return day ? formatFeedDay(day) : "Unknown date";
}

function cardKey(card: AchievementFeedCard): string {
  return card.kind === "group"
    ? `g-${card.user.user_id}-${card.achievement_set.id}-${card.day}`
    : `h-${card.id}`;
}

const SEGMENT =
  "font-label inline-flex h-9.5 flex-1 items-center justify-center border-l border-rule-strong px-3.5 text-[0.92rem] font-extrabold tracking-[0.06em] whitespace-nowrap transition-colors first:border-l-0 sm:flex-none";

function segmentClass(active: boolean): string {
  return cn(
    SEGMENT,
    active ? "bg-paper text-ink" : "text-paper-dim hover:bg-ink-3 hover:text-paper",
  );
}

function ViewTabs({ filters }: { filters: Filters }) {
  return (
    <nav
      aria-label="Feed view"
      className="flex w-full overflow-hidden rounded-sm border border-rule-strong sm:inline-flex sm:w-auto"
    >
      {FEED_VIEW_OPTIONS.map((option) => {
        const active = option.value === filters.view;
        return (
          <Link
            key={option.value}
            href={feedHref(filters, { view: option.value, page: 1 })}
            aria-current={active ? "page" : undefined}
            className={segmentClass(active)}
          >
            {option.label}
          </Link>
        );
      })}
    </nav>
  );
}

const PROVIDER_OPTIONS: { value: AchievementProvider | null; label: string }[] = [
  { value: null, label: "All" },
  { value: "retroachievements", label: PROVIDER_LABEL.retroachievements },
  { value: "steam", label: PROVIDER_LABEL.steam },
  { value: "psn", label: PROVIDER_LABEL.psn },
];

function ProviderFilter({ filters }: { filters: Filters }) {
  return (
    <nav
      aria-label="Provider"
      className="flex w-full overflow-x-auto rounded-sm border border-rule-strong sm:inline-flex sm:w-auto"
    >
      {PROVIDER_OPTIONS.map((option) => {
        const active = option.value === filters.provider;
        return (
          <Link
            key={option.value ?? "all"}
            href={feedHref(filters, { provider: option.value, page: 1 })}
            aria-current={active ? "page" : undefined}
            className={segmentClass(active)}
          >
            {option.label}
          </Link>
        );
      })}
    </nav>
  );
}

function FeedEmpty({ filters, editHref }: { filters: Filters; editHref: string }) {
  if (filters.page > 1) {
    return (
      <EmptyState>
        Nothing on this page.{" "}
        <Link href={feedHref(filters, { page: 1 })} className={INLINE_LINK}>
          Back to the first page
        </Link>
      </EmptyState>
    );
  }
  if (hasFeedFilters(filters)) {
    const provider = PROVIDER_LABEL[filters.provider!];
    return (
      <EmptyState>
        {filters.view === "highlights"
          ? `No ${provider} Highlights yet.`
          : `No ${provider} Unlocks yet.`}
      </EmptyState>
    );
  }
  if (filters.view === "highlights") {
    return (
      <EmptyState>
        No Highlights yet. Platinums, Masteries, Completions and ultra-rare
        Unlocks land here.
      </EmptyState>
    );
  }
  // Nobody has linked anything: point the viewer at their own Linked
  // Accounts.
  return (
    <div className="flex flex-col items-center gap-4 rounded-md border border-dashed border-rule-strong px-4 py-12 text-center">
      <p className="text-paper-dim">
        No one has linked a RetroAchievements, Steam or PlayStation account yet.
      </p>
      <Link
        href={editHref}
        className="font-label group inline-flex items-center gap-1.5 text-sm font-extrabold text-paper transition-colors hover:text-highlight [&_svg]:size-4 [&_svg]:transition-transform hover:[&_svg]:translate-x-0.5"
      >
        Link your accounts
        <ArrowRight aria-hidden />
      </Link>
    </div>
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

function HubSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeader title="Achievements" />
      <div className="flex flex-wrap justify-between gap-3">
        <Skeleton className="h-9.5 w-56 rounded-sm" />
        <Skeleton className="h-9.5 w-96 max-w-full rounded-sm" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}
