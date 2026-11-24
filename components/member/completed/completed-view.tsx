import type { CompletedPage } from "@/lib/members/completed-page";
import { YearDial, dialMonths } from "@/components/issue/member-year-dial";
import { ListPagination } from "@/components/list-pagination";
import { CompletedList } from "@/components/member/completed/completed-list";
import { CompletedSearch } from "@/components/member/completed/completed-search";

// The completed list's body: the year's heading and the search, the reel and
// its pages, with the year dial as a row on phones and a rail beside it on
// desktops.
export function CompletedView({
  page,
  currentPage,
  q,
  displayName,
  manage = false,
}: {
  // The owner's manage tools on the reel (spec api#451, pick 3A).
  manage?: boolean;
  page: CompletedPage;
  currentPage: number;
  q: string;
  displayName: string;
}) {
  const { view, list } = page;
  const { year, hrefFor, dialYears } = view;
  const all = { href: hrefFor("all", 1, q), count: null, on: year === "all" };
  const months =
    /^\d{4}$/.test(year) && !q ? dialMonths(year, view.monthJumps) : [];
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_5rem] lg:gap-7">
      <div className="min-w-0 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <h2 className="font-headline text-3xl sm:text-[2.5rem]">
            {q ? (
              <>Matching &ldquo;{q}&rdquo;</>
            ) : year === "all" ? (
              "Every year"
            ) : year === "unknown" ? (
              "No date"
            ) : (
              year
            )}
            <span className="font-label ml-3 align-middle text-sm font-extrabold tracking-[0.08em] text-faint-foreground">
              {list.total} {list.total === 1 ? "game" : "games"}
            </span>
          </h2>
          <CompletedSearch action={view.base} q={q} displayName={displayName} />
        </div>

        <div className="lg:hidden">
          <YearDial
            years={dialYears}
            current={year}
            months={[]}
            layout="row"
            all={all}
          />
        </div>

        <CompletedList
          page={page}
          currentPage={currentPage}
          q={q}
          displayName={displayName}
          manage={manage}
        />

        <ListPagination
          currentPage={currentPage}
          totalPages={list.totalPages}
          buildHref={(p) => hrefFor(year, p)}
        />
      </div>

      <div className="hidden lg:block">
        <YearDial years={dialYears} current={year} months={months} all={all} />
      </div>
    </div>
  );
}
