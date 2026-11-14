import Link from "next/link";
import type { CompletedPage } from "@/lib/members/completed-page";
import { COMPLETED_PAGE_SIZE } from "@/lib/members/completed-page";
import { CompletedReel } from "@/components/issue/member-completed-reel";
import { MemberListEmpty } from "@/components/member/member-game-card";

// The shown page of completions as the reel, or why there is none.
export function CompletedList({
  page,
  currentPage,
  q,
  displayName,
}: {
  page: CompletedPage;
  currentPage: number;
  q: string;
  displayName: string;
}) {
  const { list, view } = page;
  const { year } = view;
  if (!list.ok) {
    return (
      <MemberListEmpty>
        Couldn&apos;t load completed games. Try again in a moment.
      </MemberListEmpty>
    );
  }
  if (list.entries.length === 0) {
    const scope = year === "all" ? "every year" : year === "unknown" ? "entries with no date" : year;
    return (
      <div className="space-y-3">
        <MemberListEmpty>
          {q
            ? `No completed games match “${q}”.`
            : year === "all"
              ? "No completed games yet."
              : `Nothing completed in ${scope}.`}
        </MemberListEmpty>
        {q && (
          <p className="text-center">
            <Link
              href={view.hrefFor(null, 1, "")}
              className="font-label text-sm font-extrabold text-dim-foreground transition-colors hover:text-highlight"
            >
              Clear search
            </Link>
          </p>
        )}
      </div>
    );
  }
  return (
    <CompletedReel
      // A new page or year starts the spotlight on its first entry.
      key={`${year}-${q}-${currentPage}`}
      entries={list.entries}
      ownerName={displayName}
      offset={(currentPage - 1) * COMPLETED_PAGE_SIZE}
      total={list.total}
    />
  );
}
