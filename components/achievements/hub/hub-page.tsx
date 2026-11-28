import {
  feedHref,
  groupFeedByDay,
  type AchievementFeedFilters as Filters,
} from "@/lib/api/achievement-feed";
import type { HubFeed } from "@/lib/achievements/hub-feed";
import { PageHeader } from "@/components/templates/page-header";
import { ListPagination } from "@/components/list-pagination";
import { EmptyState, FeedEmpty } from "./feed-empty";
import { HubProviderFilter } from "./hub-controls";
import { HubDay } from "./hub-day";

// The community hub: every member's Unlocks across the club, newest first,
// in UTC day bands as the News page runs its days. Each row is one member's
// day in one set with every Unlock as an equal frame; details open on
// hover. It narrows by Provider; the URL holds the state.
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
  const { result, cards } = feed;
  const now = new Date();

  return (
    <div className="space-y-6">
      <PageHeader title="Achievements" badge={badge} />
      <HubProviderFilter filters={filters} />
      {!result ? (
        <EmptyState>Couldn&apos;t load the achievements. Try again in a moment.</EmptyState>
      ) : cards.length === 0 ? (
        <FeedEmpty filters={filters} editHref={editHref} />
      ) : (
        <div className="space-y-9">
          {groupFeedByDay(cards).map((day) => (
            <HubDay key={day.day ?? "unknown"} day={day} now={now} />
          ))}
        </div>
      )}
      <ListPagination
        currentPage={filters.page}
        totalPages={feed.totalPages}
        buildHref={(page) => feedHref(filters, { page })}
      />
      {cards.length > 0 && (
        <p data-slot="hub-note" className="font-label text-[0.8rem] tracking-[0.08em] text-faint-foreground">
          Days and times in UTC
        </p>
      )}
    </div>
  );
}
