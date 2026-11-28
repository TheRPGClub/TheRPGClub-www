import Link from "next/link";
import { hasNewsFilters, newsEmptyNote, newsHref, type NewsFilters } from "@/lib/news";

// What the News page says when a page holds no items: past the last page,
// nothing matching the filters, nothing in the categories the member follows,
// or no news at all. `NewsNote` is the dashed slip it says it on.

export function NewsEmpty({
  filters,
  lastPage,
  nameOf,
  elsewhere,
}: {
  filters: NewsFilters;
  // The real last page when the address is past it.
  lastPage: number | null;
  nameOf: (key: string | null) => string;
  elsewhere: boolean;
}) {
  if (filters.page > 1) {
    const back = lastPage ?? 1;
    return (
      <NewsNote>
        Nothing on this page.{" "}
        <Link href={newsHref(filters, { page: back })} className={INLINE_LINK}>
          {back > 1 ? "Back to the last page" : "Back to the first page"}
        </Link>
      </NewsNote>
    );
  }
  if (hasNewsFilters(filters)) {
    return (
      <NewsNote>
        {newsEmptyNote(filters, nameOf, elsewhere)}{" "}
        <Link href={newsHref(filters, { categories: [], q: "" })} className={INLINE_LINK}>
          Clear filters
        </Link>
      </NewsNote>
    );
  }
  if (elsewhere) {
    return (
      <NewsNote>
        Nothing in the News Categories you follow. Choose one in the filter, or turn them
        back on in{" "}
        <Link href="/settings" className={INLINE_LINK}>
          Settings
        </Link>
        .
      </NewsNote>
    );
  }
  return (
    <NewsNote>
      No news yet. It lands here when members post in the News Category threads on Discord.
    </NewsNote>
  );
}

const INLINE_LINK =
  "font-semibold text-foreground underline underline-offset-4 transition-colors hover:text-highlight";

export function NewsNote({ children }: { children: React.ReactNode }) {
  return (
    <p data-slot="community-note" className="rounded-md border border-dashed border-border-strong px-4 py-12 text-center text-dim-foreground">
      {children}
    </p>
  );
}
