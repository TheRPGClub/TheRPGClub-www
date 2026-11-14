import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getSession, requireFeature } from "@/lib/session";
import { PreviewBadge } from "@/components/feature/preview-badge";
import {
  fetchAchievementFeed,
  feedHref,
  groupFeedByDay,
  hasFeedFilters,
  parseFeedFilters,
  type AchievementFeedFilters as Filters,
  type FeedDay,
} from "@/lib/api/achievement-feed";
import { paginationOf } from "@/lib/api/pagination";
import type {
  AchievementFeedCard,
  AchievementFeedGroup,
  AchievementSet,
} from "@/lib/api/types";
import {
  PROVIDER_LABEL,
  formatFeedDay,
  linkedAccountsEditHref,
} from "@/lib/achievements";
import { dayTally, highlightsSince, hubWeek, leadHighlight } from "@/lib/achievements/hub";
import { getSetTint } from "@/lib/achievements/tint";
import { fallbackTint, type SetTint } from "@/lib/achievements/tint-color";
import { HubGroupCard } from "@/components/achievements/hub/group-card";
import { HighlightRail } from "@/components/achievements/hub/highlight-rail";
import { HighlightTile } from "@/components/achievements/hub/highlight-tile";
import { HubProviderFilter, HubViewTabs } from "@/components/achievements/hub/hub-controls";
import { DayTape } from "@/components/achievements/hub/parts";
import { PageHeader } from "@/components/templates/page-header";
import { ListPagination } from "@/components/list-pagination";
import { Skeleton } from "@/components/ui/skeleton";

// The community hub: every member's Unlocks across the club, newest first,
// in UTC day bands. Latest lays each day's member-plus-game cards out as a
// wall (a card holding a Highlight takes double size) beside a desktop rail
// of this week's Highlights. Highlights is the wall of Highlights alone, each
// at double size. Both narrow by Provider; the URL holds the state.

const RAIL_LIMIT = 6;

export default async function AchievementsHubPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseFeedFilters(await searchParams);

  return (
    <Suspense fallback={<HubSkeleton view={filters.view} />}>
      <AchievementsHub filters={filters} />
    </Suspense>
  );
}

async function AchievementsHub({ filters }: { filters: Filters }) {
  // The feed needs auth; confirm a session before a fetch that can only 401.
  const session = await getSession();
  if (!session) redirect("/");
  const features = await requireFeature("achievement_hub");

  const latest = filters.view === "latest";
  // The rail reads the Highlights view's first page under the same Provider.
  const [result, railResult] = await Promise.all([
    fetchAchievementFeed(filters),
    latest
      ? fetchAchievementFeed({ view: "highlights", provider: filters.provider, page: 1 })
      : null,
  ]);
  const cards = result?.cards ?? [];
  const { total, totalPages } = paginationOf(result?.meta ?? undefined, cards.length);
  const editHref = linkedAccountsEditHref(session.principal.discord_id);

  const week = hubWeek(new Date());
  const railCards = highlightsSince(railResult?.cards ?? [], week.from, RAIL_LIMIT);
  const tints = await setTints([...cards, ...railCards]);

  const feed = !result ? (
    <EmptyState>Couldn&apos;t load the achievements. Try again in a moment.</EmptyState>
  ) : cards.length === 0 ? (
    <FeedEmpty filters={filters} editHref={editHref} />
  ) : latest ? (
    <div className="space-y-7">
      {groupFeedByDay(cards).map((day, i) => (
        <LatestDay key={day.day ?? "unknown"} day={day} index={i} tints={tints} />
      ))}
    </div>
  ) : (
    <HighlightsWall cards={cards} tints={tints} />
  );

  const pagination = (
    <ListPagination
      currentPage={filters.page}
      totalPages={totalPages}
      buildHref={(page) => feedHref(filters, { page })}
    />
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Achievements"
        badge={features.preview("achievement_hub") && <PreviewBadge />}
        count={
          result && !latest && total > 0 ? (
            <span className="text-base text-paper-dim normal-case">
              <span className="font-headline mr-1.5 text-[1.6rem] leading-none text-paper">
                {total}
              </span>
              {total === 1 ? "Highlight" : "Highlights"}
            </span>
          ) : undefined
        }
        actions={<HubViewTabs filters={filters} />}
      />

      {latest ? (
        <div className="grid gap-x-8 gap-y-10 xl:grid-cols-[minmax(0,62fr)_minmax(0,38fr)]">
          <div className="min-w-0 space-y-4">
            <FilterRow filters={filters} />
            {feed}
            {pagination}
          </div>
          <aside className="hidden min-w-0 xl:block">
            <HighlightRail
              cards={railCards}
              weekLabel={week.label}
              tints={tints}
              allHref={feedHref(filters, { view: "highlights", page: 1 })}
            />
          </aside>
        </div>
      ) : (
        <div className="space-y-4">
          <FilterRow filters={filters} />
          {feed}
          {pagination}
        </div>
      )}
    </div>
  );
}

// One tint per Achievement Set on the page, sampled once each.
async function setTints(cards: AchievementFeedCard[]): Promise<(setId: number) => SetTint> {
  const sets = new Map<number, AchievementSet>();
  for (const card of cards) sets.set(card.achievement_set.id, card.achievement_set);
  const entries = await Promise.all(
    [...sets.values()].map(
      async (set) =>
        [set.id, await getSetTint({ iconUrl: set.icon_url, setId: set.id })] as const,
    ),
  );
  const byId = new Map(entries);
  return (setId) => byId.get(setId) ?? fallbackTint(setId);
}

function FilterRow({ filters }: { filters: Filters }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <HubProviderFilter filters={filters} />
      <p className="font-label ml-auto text-[0.8rem] tracking-[0.08em] text-paper-mute">
        Days in UTC
      </p>
    </div>
  );
}

function dayLabel(day: string | null): string {
  if (!day) return "Unknown date";
  return WEEKDAY.format(new Date(`${day}T00:00:00Z`));
}

const WEEKDAY = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

function LatestDay({
  day,
  index,
  tints,
}: {
  day: FeedDay;
  index: number;
  tints: (setId: number) => SetTint;
}) {
  // Highlight cards span the wall; so does a day's odd plain card out, so
  // the wall never ends on a hole.
  const groups = day.cards.filter(
    (card): card is AchievementFeedGroup => card.kind === "group",
  );
  const plain = groups.filter((card) => !leadHighlight(card));
  const lone = plain.length % 2 ? plain.at(-1) : undefined;
  return (
    <section aria-label={day.day ? formatFeedDay(day.day) : "Unknown date"} className="space-y-3">
      <DayTape day={day.day} label={dayLabel(day.day)} tally={dayTally(day.cards)} index={index} />
      <ul className="grid grid-flow-row-dense gap-3 sm:grid-cols-2">
        {groups.map((card) => (
            <li
              key={`g-${card.user.user_id}-${card.achievement_set.id}-${card.day}`}
              className={
                card === lone || leadHighlight(card) ? "min-w-0 sm:col-span-2" : "min-w-0"
              }
            >
              <HubGroupCard card={card} tint={tints(card.achievement_set.id)} className="h-full" />
            </li>
        ))}
      </ul>
    </section>
  );
}

// Highlights are rare enough that day bands would leave a wall of gaps, so
// the wall runs on and each tag carries its own date.
function HighlightsWall({
  cards,
  tints,
}: {
  cards: AchievementFeedCard[];
  tints: (setId: number) => SetTint;
}) {
  return (
    <ul className="grid grid-cols-2 gap-x-6 gap-y-9 px-3 pt-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {cards.map((card, i) =>
        card.kind === "highlight" ? (
          <li key={`h-${card.id}`} className="min-w-0">
            <HighlightTile card={card} tint={tints(card.achievement_set.id)} index={i} />
          </li>
        ) : null,
      )}
    </ul>
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

function HubSkeleton({ view }: { view: Filters["view"] }) {
  return (
    <div className="space-y-5">
      <PageHeader title="Achievements" actions={<Skeleton className="h-[34px] w-56 rounded-sm" />} />
      <div className="grid gap-8 xl:grid-cols-[minmax(0,62fr)_minmax(0,38fr)]">
        <div className="space-y-4">
          <Skeleton className="h-[26px] w-96 max-w-full rounded-xs" />
          <Skeleton className="h-7 w-40 rounded-xs" />
          {view === "latest" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Skeleton className="h-48 rounded-md sm:col-span-2" />
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-44 rounded-md" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-52 rounded-md" />
              ))}
            </div>
          )}
        </div>
        {view === "latest" && (
          <div className="hidden space-y-3 xl:block">
            <Skeleton className="h-9 w-64" />
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
