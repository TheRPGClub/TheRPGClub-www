import { ChevronDown, SlidersHorizontal } from "lucide-react";
import type { CSSProperties } from "react";
import { newsInk, type NewsCategory } from "@/lib/news";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

// The News page's category rail: a 250px column beside the grid from `lg`,
// and a "Filter" disclosure above the grid below it, both holding the same
// list. Today it lists the News Categories with their inks (the key to the
// cards' tags). www#77 makes it the filter: a search field on top, each row a
// toggle through the page address with its count (or "hidden by you"), and
// "Show all categories" at the foot.

export function NewsCategoryRail({ categories }: { categories: NewsCategory[] }) {
  if (categories.length === 0) return null;
  return (
    <>
      <aside className="hidden lg:sticky lg:top-[84px] lg:block lg:self-start">
        <CategoryList categories={categories} headingId="news-categories-rail" />
      </aside>
      <details className="group/filter mb-1 lg:hidden">
        <summary
          className={cn(
            buttonVariants({ variant: "outline" }),
            "cursor-pointer list-none group-open/filter:bg-ink-3 [&::-webkit-details-marker]:hidden",
          )}
        >
          <SlidersHorizontal aria-hidden className="size-4" />
          Filter
          <ChevronDown
            aria-hidden
            className="size-4 text-paper-mute transition-transform group-open/filter:rotate-180"
          />
        </summary>
        <div className="mt-3 max-w-md">
          <CategoryList categories={categories} headingId="news-categories-filter" />
        </div>
      </details>
    </>
  );
}

function CategoryList({
  categories,
  headingId,
}: {
  categories: NewsCategory[];
  headingId: string;
}) {
  return (
    <section aria-labelledby={headingId}>
      <h2
        id={headingId}
        className="font-label mb-1.5 text-[0.8rem] tracking-[0.08em] text-paper-mute"
      >
        News Categories
      </h2>
      <ul>
        {categories.map((category) => {
          const ink = newsInk(category.key);
          return (
            <li
              key={category.key}
              className="font-label flex h-[38px] items-center gap-2.5 border-b border-rule text-[0.95rem] text-paper"
            >
              <InkSquare color={ink.color} dashed={ink.dashed} />
              <span className="min-w-0 truncate">{category.name}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// A category's ink as a 16px square: filled when it is in the view. Rumours
// carries a dashed edge, since it is unconfirmed news.
export function InkSquare({
  color,
  dashed,
  filled = true,
}: {
  color: string;
  dashed: boolean;
  filled?: boolean;
}) {
  return (
    <i
      aria-hidden
      style={{ "--news-ink": color } as CSSProperties}
      className={cn(
        "size-4 shrink-0 rounded-xs",
        filled ? "bg-(--news-ink)" : "shadow-[inset_0_0_0_1.5px_var(--news-ink)]",
        dashed &&
          (filled
            ? "outline-[1.5px] -outline-offset-[4px] outline-ink/70 outline-dashed"
            : "border-[1.5px] border-dashed border-(--news-ink) shadow-none"),
      )}
    />
  );
}
