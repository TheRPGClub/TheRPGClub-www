"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

// A grid of stamps that shows the first few and opens the rest in place:
// as one more stamp-sized "+2 more" tile (the current row), or a "Show all
// 14" button under the grid (the past case).
export function StampOverflow({
  items,
  limit,
  more,
  className,
}: {
  items: React.ReactNode[];
  limit: number;
  more: "tile" | "button";
  // Layout only: the grid.
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const hidden = open ? 0 : Math.max(items.length - limit, 0);
  const shown = hidden > 0 ? items.slice(0, limit) : items;
  return (
    <>
      <ul className={className}>
        {shown.map((item, i) => (
          <li key={i} className="min-w-0">
            {item}
          </li>
        ))}
        {hidden > 0 && more === "tile" && (
          <li className="min-h-[200px]">
            <Button type="button" variant="stamp-more" size="bare" className="size-full" onClick={() => setOpen(true)}>
              +{hidden}
              <span className="font-label text-[0.8rem] tracking-[0.08em]">more Runs</span>
            </Button>
          </li>
        )}
      </ul>
      {hidden > 0 && more === "button" && (
        <Button type="button" variant="outline" size="sm" className="mt-6" onClick={() => setOpen(true)}>
          Show all {items.length}
        </Button>
      )}
    </>
  );
}
