import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { newsInk, type NewsCategory } from "@/lib/news";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { InkSquare } from "./ink-square";

// The News page's category rail: a 15.5rem column beside the grid from `lg`,
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
              <InkSquare {...ink} />
              <span className="min-w-0 truncate">{category.name}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
