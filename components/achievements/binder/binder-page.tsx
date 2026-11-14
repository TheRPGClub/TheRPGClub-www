import type { MemberAchievementSummary } from "@/lib/api/types";
import { memberSetHref } from "@/lib/achievements";
import {
  SETS_PER_PAGE,
  memberAchievementsPageHref,
  type BinderHref,
  type MemberAchievementsQuery,
} from "@/lib/member-achievements";
import type { BinderPages } from "@/lib/member-achievements-binder";
import { ListPagination } from "@/components/list-pagination";
import { cn } from "@/lib/utils";
import { BinderIndexRow, BinderRings } from "../member-binder";
import { UnlockList } from "../unlock-list";
import { BinderFilterTabs } from "./binder-filter-tabs";
import { BinderIndexHeader } from "./binder-index-header";
import { BinderMemberPage } from "./binder-member-page";
import { BinderNote } from "./binder-notes";

// A member's achievements as an open binder. The left page is the member:
// their name, totals, Linked Accounts and four rarest Unlocks. The right page
// is the index, one row per Achievement Set with a game-tint tab past the
// binder's edge, or the flat list of Unlocks (`?tab=unlocks`). Filter tabs
// for the index (status and Provider) sit on the binder's top edge. On
// phones the binder is a single page: the member first, the index below.
export function BinderPage({
  userId,
  displayName,
  isSelf,
  summary,
  query,
  pages,
  badge,
}: {
  userId: string;
  displayName: string;
  isSelf: boolean;
  summary: MemberAchievementSummary;
  query: MemberAchievementsQuery;
  pages: BinderPages;
  // The staff "Preview" badge, beside the views.
  badge?: React.ReactNode;
}) {
  const href: BinderHref = (next) => memberAchievementsPageHref(userId, query, next);
  const sets = query.tab === "sets";
  const { sets: setsPage, unlocks: unlocksPage } = pages;
  const rows = setsPage?.items.length ?? 0;

  return (
    <div className="pt-2 pb-6">
      {sets && (
        <BinderFilterTabs
          query={query}
          linked={summary.linked_accounts.map((a) => a.provider)}
          counts={pages.statusCounts}
          href={href}
        />
      )}

      <div
        className={cn(
          "relative mr-4 flex flex-col gap-2 rounded-lg bg-border p-2 shadow-[0_24px_60px_rgb(0_0_0/0.6)]",
          "xl:mr-12 xl:grid xl:grid-cols-[25rem_30px_minmax(0,1fr)] xl:gap-0 xl:p-2.5",
          !sets && "mt-6 xl:mt-8",
        )}
      >
        <BinderMemberPage
          summary={summary}
          userId={userId}
          displayName={displayName}
          isSelf={isSelf}
        />

        <BinderRings count={Math.min(12, Math.max(4, Math.ceil(rows / 2)))} />

        <section
          aria-labelledby="binder-view"
          className="rounded-md bg-card px-4 pt-4 pb-5 sm:px-6 xl:pr-6 xl:pl-6 xl:shadow-[inset_18px_0_22px_-14px_rgb(0_0_0/0.7)]"
        >
          <BinderIndexHeader
            query={query}
            href={href}
            setCount={setsPage?.failed ? null : (setsPage?.total ?? null)}
            unlockCount={summary.totals.unlocks}
            badge={badge}
          />

          {setsPage ? (
            setsPage.failed ? (
              <BinderNote>Couldn&apos;t load sets. Try again in a moment.</BinderNote>
            ) : setsPage.items.length === 0 ? (
              <BinderNote>
                {query.filter.provider || query.filter.status
                  ? "No sets match these filters."
                  : "No sets synced yet."}
              </BinderNote>
            ) : (
              <ol aria-label="Achievement Sets">
                {setsPage.items.map((row, i) => (
                  <BinderIndexRow
                    key={row.id}
                    row={row}
                    number={(query.page - 1) * SETS_PER_PAGE + i + 1}
                    tint={pages.tints[i]}
                    href={memberSetHref(userId, row.achievement_set.id)}
                  />
                ))}
              </ol>
            )
          ) : unlocksPage?.failed ? (
            <BinderNote>Couldn&apos;t load Unlocks. Try again in a moment.</BinderNote>
          ) : !unlocksPage || unlocksPage.items.length === 0 ? (
            <BinderNote>No Unlocks synced yet.</BinderNote>
          ) : (
            <UnlockList unlocks={unlocksPage.items} userId={userId} className="mt-1" />
          )}

          <div className="pt-5 empty:hidden">
            <ListPagination
              currentPage={query.page}
              totalPages={(setsPage ?? unlocksPage)?.totalPages ?? 1}
              buildHref={(p) => href({ page: p })}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
