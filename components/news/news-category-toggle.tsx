import { newsInk, type NewsCategoryRow } from "@/lib/news";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { InkSquare } from "./ink-square";

// One News Category in the rail's filter, as a toggle button. Without JS it
// submits the chosen set after toggling (no name when that set is empty, so
// the address stays bare); once hydrated the form pushes its data-href.
export function NewsCategoryToggle({ row }: { row: NewsCategoryRow }) {
  const counted = row.chosen || !row.hidden;
  return (
    <Button
      type="submit"
      variant="filter-option"
      size="bare"
      name={row.next.length ? "category" : undefined}
      value={row.next.join(",")}
      data-href={row.href}
      aria-pressed={row.chosen}
      className="group/row flex h-[38px] w-full cursor-pointer items-center gap-2.5 text-left text-[0.9rem]"
    >
      <InkSquare {...newsInk(row.key)} filled={row.inView} />
      <span
        className={cn(
          "min-w-0 truncate transition-colors group-hover/row:text-highlight",
          row.inView ? "text-foreground" : "text-faint-foreground",
        )}
      >
        {row.name}
      </span>
      {row.note && (
        <span className="ml-auto shrink-0 pr-0.5 text-[0.8rem] text-faint-foreground">
          {row.note}
          {counted && <span className="sr-only">{row.note === "1" ? " item" : " items"}</span>}
        </span>
      )}
    </Button>
  );
}
