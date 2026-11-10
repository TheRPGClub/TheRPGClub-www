"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Search, X } from "lucide-react";
import {
  NEWS_PATH,
  newsHref,
  newsInk,
  type NewsCategoryRow,
  type NewsFilters,
} from "@/lib/news";
import { cn } from "@/lib/utils";
import { InkSquare } from "./ink-square";

// The rail's filter: the search field, the News Categories as toggles, and
// "Show all categories". The search stays when the category list couldn't
// load; a short note takes the list's place. Both are plain GET forms on /news, so they work
// before hydration; once hydrated they push the canonical address
// (newsHref) instead, without scrolling, and dim while the page loads.

const FOCUS =
  "outline-none focus-visible:ring-3 focus-visible:ring-highlight/50";

export function NewsFilter({
  rows,
  filters,
  headingId,
}: {
  rows: NewsCategoryRow[];
  filters: NewsFilters;
  headingId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const go = (href: string) =>
    startTransition(() => router.push(href, { scroll: false }));

  return (
    <div
      aria-busy={pending}
      className={cn("transition-opacity duration-150", pending && "opacity-60")}
    >
      <SearchField filters={filters} go={go} />
      <section aria-labelledby={headingId} className="mt-[18px]">
        <h2
          id={headingId}
          className="font-label mb-1.5 text-[0.8rem] tracking-[0.08em] text-paper-mute"
        >
          News Categories
        </h2>
        {rows.length === 0 ? (
          <p className="text-sm text-paper-dim">
            Couldn&apos;t load the News Categories. Search still works.
          </p>
        ) : (
          <form
            action={NEWS_PATH}
            method="get"
            onSubmit={(event) => {
              const submitter = (event.nativeEvent as SubmitEvent).submitter;
              const href = submitter?.dataset.href;
              if (!href) return;
              event.preventDefault();
              go(href);
            }}
          >
            {filters.q && <input type="hidden" name="q" value={filters.q} />}
            <ul>
              {rows.map((row) => (
                <li key={row.key} className="border-b border-rule">
                  <CategoryToggle row={row} />
                </li>
              ))}
            </ul>
          </form>
        )}
        {filters.categories.length > 0 && (
          <Link
            href={newsHref(filters, { categories: [] })}
            scroll={false}
            className={cn(
              "font-label mt-3 inline-block rounded-xs text-[0.8rem] text-paper-dim underline decoration-gotm decoration-2 underline-offset-4 transition-colors hover:text-highlight",
              FOCUS,
            )}
          >
            Show all categories
          </Link>
        )}
      </section>
    </div>
  );
}

// One category as a toggle button. Without JS it submits the chosen set
// after toggling (no name when that set is empty, so the address stays bare).
function CategoryToggle({ row }: { row: NewsCategoryRow }) {
  const counted = row.chosen || !row.hidden;
  return (
    <button
      type="submit"
      name={row.next.length ? "category" : undefined}
      value={row.next.join(",")}
      data-href={row.href}
      aria-pressed={row.chosen}
      className={cn(
        "group/row font-label flex h-[38px] w-full cursor-pointer items-center gap-2.5 rounded-xs text-left text-[0.9rem]",
        FOCUS,
      )}
    >
      <InkSquare {...newsInk(row.key)} filled={row.inView} />
      <span
        className={cn(
          "min-w-0 truncate transition-colors group-hover/row:text-highlight",
          row.inView ? "text-paper" : "text-paper-mute",
        )}
      >
        {row.name}
      </span>
      {row.note && (
        <span className="ml-auto shrink-0 pr-0.5 text-[0.8rem] text-paper-mute">
          {row.note}
          {counted && <span className="sr-only">{row.note === "1" ? " item" : " items"}</span>}
        </span>
      )}
    </button>
  );
}

// "Search news titles": submits on Enter. The text follows the address
// (back/forward, "Clear filters") by re-syncing during render.
function SearchField({
  filters,
  go,
}: {
  filters: NewsFilters;
  go: (href: string) => void;
}) {
  const [text, setText] = useState(filters.q);
  const [synced, setSynced] = useState(filters.q);
  if (synced !== filters.q) {
    setSynced(filters.q);
    setText(filters.q);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    go(newsHref(filters, { q: text }));
  }

  return (
    <form action={NEWS_PATH} method="get" role="search" onSubmit={submit}>
      {filters.categories.length > 0 && (
        <input type="hidden" name="category" value={filters.categories.join(",")} />
      )}
      <div className="flex h-9 items-center gap-2 rounded-sm border border-rule-strong bg-ink-2 pr-1 pl-3 text-paper-mute transition-colors focus-within:border-paper-mute">
        <Search aria-hidden className="size-4 shrink-0" />
        <input
          type="search"
          name="q"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Search news titles"
          aria-label="Search news titles"
          enterKeyHint="search"
          className="h-full min-w-0 flex-1 bg-transparent text-[0.92rem] text-paper outline-none placeholder:text-paper-mute [&::-webkit-search-cancel-button]:hidden"
        />
        {filters.q && (
          <Link
            href={newsHref(filters, { q: "" })}
            scroll={false}
            aria-label="Clear search"
            className={cn(
              "grid size-7 shrink-0 place-items-center rounded-xs transition-colors hover:text-highlight",
              FOCUS,
            )}
          >
            <X aria-hidden className="size-4" />
          </Link>
        )}
      </div>
    </form>
  );
}
