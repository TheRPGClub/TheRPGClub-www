import {
  feedHref,
  groupFeedByDay,
  type AchievementFeedFilters as Filters,
} from "@/lib/api/achievement-feed";
import type { HubFeed } from "@/lib/achievements/hub-feed";
import { PageHeader } from "@/components/templates/page-header";
import { ListPagination } from "@/components/list-pagination";
import { EmptyState, FeedEmpty } from "./feed-empty";
import { HighlightRail } from "./highlight-rail";
import { HubFilterRow, HubViewTabs } from "./hub-controls";
import { HighlightsWall, LatestDay } from "./latest-day";

// The community hub: every member's Unlocks across the club, newest first,
// in UTC day bands. Latest lays each day's member-plus-game cards out as a
// wall (a card holding a Highlight takes double size) beside a desktop rail
// of this week's Highlights. Highlights is the wall of Highlights alone, each
// at double size. Both narrow by Provider; the URL holds the state.
export function HubPage({
  filters,
  feed,
  badge,
  editHref,
}: {
  filters: Filters;
  feed: HubFeed;
  // Beside the title, e.g. the staff "Preview" badge.
  badge?: React.ReactNode;
  // The viewer's own Linked Accounts, for the empty hub.
  editHref: string;
}) {
  const { result, cards, total, tints } = feed;
  const latest = filters.view === "latest";

  const list = !result ? (
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

  const column = (
    <>
      <HubFilterRow filters={filters} />
      {list}
      <ListPagination
        currentPage={filters.page}
        totalPages={feed.totalPages}
        buildHref={(page) => feedHref(filters, { page })}
      />
    </>
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Achievements"
        badge={badge}
        count={
          result && !latest && total > 0 ? (
            <span className="text-base text-dim-foreground normal-case">
              <span className="font-headline mr-1.5 text-[1.6rem] leading-none text-foreground">
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
          <div className="min-w-0 space-y-4">{column}</div>
          <aside className="hidden min-w-0 xl:block">
            <HighlightRail
              cards={feed.railCards}
              weekLabel={feed.weekLabel}
              tints={tints}
              allHref={feedHref(filters, { view: "highlights", page: 1 })}
            />
          </aside>
        </div>
      ) : (
        <div className="space-y-4">{column}</div>
      )}
    </div>
  );
}
