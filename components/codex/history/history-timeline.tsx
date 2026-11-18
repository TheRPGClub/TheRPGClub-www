import type { ReactNode } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import {
  KIND_NAME,
  bookPage,
  eventCount,
  historyHref,
  kindCounts,
  orderedEvents,
  type HistoryQuery,
} from "@/lib/codex/history";
import { HISTORY_PATH, NEW_HISTORY_PATH } from "@/lib/codex/paths";
import type { CodexEntry } from "@/lib/codex/types";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/templates/page-header";
import { ListPagination } from "@/components/list-pagination";
import { HistoryTools } from "./kind-filter";
import { YearChapter } from "./year-chapter";
import { YearGap } from "./year-gap";

export const HISTORY_PER_PAGE = 40;
const SLIP = "mt-7 rounded-md border border-dashed border-border-strong px-4 py-5 text-dim-foreground";

// The Club History timeline (www#126, design 2B): the header and intro, the
// Kind filter and order, then the book, a chapter per year with one-line
// gaps for the years between with nothing recorded. For everyone, a
// Visitor included; Admins and above get Add, Edit and Delete.
export function HistoryTimeline({
  events,
  query,
  linked,
  canAdd,
  badge,
  seeAlso,
}: {
  // The whole Club History, oldest first; null when it couldn't be read.
  events: CodexEntry[] | null;
  query: HistoryQuery;
  linked: boolean;
  canAdd: boolean;
  badge?: ReactNode;
  seeAlso?: (event: CodexEntry) => ReactNode;
}) {
  const all = events ?? [];
  const shown = orderedEvents(all, query.kind, query.order);
  const pages = Math.max(1, Math.ceil(shown.length / HISTORY_PER_PAGE));
  const book = bookPage(shown, query.page, HISTORY_PER_PAGE);
  const add = canAdd && (
    <ButtonLink href={NEW_HISTORY_PATH} variant="highlight">
      <Plus aria-hidden />
      Add a History Event
    </ButtonLink>
  );
  return (
    <div className="pb-10">
      <PageHeader title="Club History" badge={badge} count={events ? eventCount(all.length) : null} actions={add} />
      <p className="mt-3 max-w-[70ch] text-dim-foreground">
        How the club got here, from a subreddit in 2016 to the server today. The staff keep this record, and every date
        is as exact as the club remembers it.
      </p>
      {events === null && <p className={SLIP}>The Club History couldn&apos;t be read just now. Try again in a moment.</p>}
      {events && all.length === 0 && (
        <div className={`${SLIP} flex flex-wrap items-center justify-between gap-3`}>
          <p>The Club History is still to be written.</p>
          {add}
        </div>
      )}
      {all.length > 0 && <HistoryTools query={query} total={all.length} counts={kindCounts(all)} />}
      {all.length > 0 && shown.length === 0 && (
        <p className={SLIP}>
          No {query.kind ? `${KIND_NAME[query.kind]} ` : ""}History Events.{" "}
          <Link href={historyHref(HISTORY_PATH, { order: query.order })} className="text-foreground underline underline-offset-4">
            Clear filter
          </Link>
        </p>
      )}
      {shown.length > 0 && book.length === 0 && (
        <p className={SLIP}>
          There&apos;s no page {query.page}.{" "}
          <Link href={historyHref(HISTORY_PATH, { ...query, page: 1 })} className="text-foreground underline underline-offset-4">
            Back to the first page
          </Link>
        </p>
      )}
      {book.length > 0 && (
        <div className="mt-6.5">
          {book.map((item, i) =>
            item.type === "gap" ? (
              <YearGap key={`gap-${item.year}`} year={item.year} />
            ) : (
              <YearChapter key={`${item.year}-${i}`} {...item} linked={linked} seeAlso={seeAlso} />
            ),
          )}
        </div>
      )}
      {pages > 1 && (
        <div className="mt-6 border-t border-border pt-4">
          <ListPagination currentPage={query.page} totalPages={pages} buildHref={(page) => historyHref(HISTORY_PATH, { ...query, page })} />
        </div>
      )}
    </div>
  );
}
