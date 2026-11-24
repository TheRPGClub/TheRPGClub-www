import { Archive, Check, Flag, Gamepad2, Heart, Hourglass, Pencil, Plus, type LucideIcon } from "lucide-react";
import type { ShelfList, ShelfRow } from "@/lib/games/shelf";
import { cn } from "@/lib/utils";

export const SHELF_ICONS: Record<ShelfList, LucideIcon> = {
  now_playing: Gamepad2,
  completed: Flag,
  backlog: Hourglass,
  favorite: Heart,
  collection: Archive,
};

// One list in the split button's menu (1A): a square holding a check when
// the game is on the list (else the list's icon), the list's name over its
// state, and the row's own verb at the right. The caller wraps it in the
// menu item (desktop) or a pick-row button (the phone's sheet).
export function ShelfRowContent({ row }: { row: ShelfRow }) {
  const Icon = row.on ? Check : SHELF_ICONS[row.list];
  const Verb = row.mode === "edit" ? Pencil : Plus;
  return (
    <>
      <span
        aria-hidden
        className={cn(
          "grid size-8 flex-none place-items-center rounded-[2.4px] [&_svg]:size-4",
          row.on ? "bg-foreground text-background" : "bg-muted text-faint-foreground",
        )}
      >
        <Icon />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="font-label block text-[0.95rem] leading-[1.1] font-extrabold tracking-[0.06em] text-foreground uppercase">
          {row.title}
        </span>
        <span className={cn("mt-0.5 block truncate text-[0.84rem]", row.on ? "text-dim-foreground" : "text-faint-foreground")}>
          {row.state}
        </span>
      </span>
      <span
        className={cn(
          "font-label inline-flex flex-none items-center gap-1.25 text-[0.8rem] leading-none font-extrabold tracking-[0.07em] whitespace-nowrap uppercase [&_svg]:size-3.5",
          row.on && row.mode !== "log" ? "text-dim-foreground" : "text-foreground",
        )}
      >
        <Verb aria-hidden />
        {row.action}
      </span>
    </>
  );
}

// The row's name for assistive tech: "Backlog, not on it: Add".
export function shelfRowLabel(row: ShelfRow): string {
  return `${row.title}, ${row.state}: ${row.action}`;
}
