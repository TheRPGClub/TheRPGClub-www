import Link from "next/link";
import type { NewsFilters, NewsItem } from "@/lib/news";
import { switchedOffNames, type NewsShelf } from "@/lib/news-shelves";
import { NewsNote } from "../news-empty";
import { NewsLeadRow } from "./news-lead-row";
import { NewsShelfSection } from "./news-shelf";

// Shelves: the lead row, then one shelf per followed News Category in News
// Category order, then a closing line naming the switched-off categories
// with a link to Settings. Every category switched off, or no news at all,
// says so instead.

const INLINE_LINK =
  "font-semibold text-foreground underline underline-offset-4 transition-colors hover:text-highlight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight";

export function NewsShelvesView({
  shelves,
  filters,
  lead,
  hidden,
  nameOf,
  now,
}: {
  shelves: NewsShelf[];
  filters: NewsFilters;
  lead: NewsItem[];
  hidden: string[];
  nameOf: (key: string | null) => string;
  now: Date;
}) {
  const off = switchedOffNames(hidden, nameOf);

  if (shelves.length === 0) {
    return (
      <NewsNote>
        You switched off every News Category, so there are no shelves. Turn some back on in{" "}
        <Link href="/settings" className={INLINE_LINK}>
          Settings
        </Link>
        .
      </NewsNote>
    );
  }
  if (lead.length === 0) {
    return (
      <NewsNote>
        No news yet. It lands here when members post in the News Category threads on Discord.
      </NewsNote>
    );
  }
  return (
    <div className="space-y-7">
      <NewsLeadRow items={lead} nameOf={nameOf} now={now} />
      {shelves.map((shelf) => (
        <NewsShelfSection key={shelf.category_key} shelf={shelf} filters={filters} now={now} />
      ))}
      {off && (
        <p className="border-t border-border pt-4 text-sm text-dim-foreground">
          Not shelved: {off}, switched off by you. Change that in{" "}
          <Link href="/settings" className={INLINE_LINK}>
            Settings
          </Link>
          .
        </p>
      )}
    </div>
  );
}
