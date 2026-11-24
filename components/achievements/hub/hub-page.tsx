import {
  feedHref,
  groupFeedByDay,
  type AchievementFeedFilters as Filters,
} from "@/lib/api/achievement-feed";
import type { HubFeed } from "@/lib/achievements/hub-feed";
import { PageHeader } from "@/components/templates/page-header";
import { ListPagination } from "@/components/list-pagination";
import { EmptyState, FeedEmpty } from "./feed-empty";
import { HubFilterRow } from "./hub-controls";
import { LatestDay } from "./latest-day";

// The community hub: every member's Unlocks across the club, newest first,
// in UTC day bands. Each day lays its member-plus-game cards out as a wall
// (a card holding a Highlight takes double size). It narrows by Provider;
// the URL holds the state.
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
  const { result, cards, tints } = feed;

  const list = !result ? (
    <EmptyState>Couldn&apos;t load the achievements. Try again in a moment.</EmptyState>
  ) : cards.length === 0 ? (
    <FeedEmpty filters={filters} editHref={editHref} />
  ) : (
    <div className="space-y-7">
      {groupFeedByDay(cards).map((day, i) => (
        <LatestDay key={day.day ?? "unknown"} day={day} index={i} tints={tints} />
      ))}
    </div>
  );

  return (
    <div className="space-y-5">
      <PageHeader title="Achievements" badge={badge} />
      <div className="space-y-4">
        <HubFilterRow filters={filters} />
        {list}
        <ListPagination
          currentPage={filters.page}
          totalPages={feed.totalPages}
          buildHref={(page) => feedHref(filters, { page })}
        />
      </div>
    </div>
  );
}
