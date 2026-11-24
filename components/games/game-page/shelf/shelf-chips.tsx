import type { ShelfChip } from "@/lib/games/shelf";
import { Badge } from "@/components/ui/badge";
import { SHELF_ICONS } from "./shelf-row";

// Where the game already is on the member's lists, beside the split button
// (1A): "Playing since 9 Nov", "Completed ×2", "Favorite No. 2". A game on
// none says so in quiet label caps.
export function ShelfChips({ chips }: { chips: ShelfChip[] }) {
  if (chips.length === 0) {
    return (
      <span className="font-label ml-1 text-[0.82rem] font-bold tracking-[0.07em] text-faint-foreground uppercase">
        Not on your lists
      </span>
    );
  }
  return (
    <ul aria-label="On your lists" className="contents">
      {chips.map((chip) => {
        const Icon = SHELF_ICONS[chip.list];
        return (
          <li key={chip.list} className="contents">
            <Badge tone="shelf" className="h-7 gap-1.5 px-2.25">
              <Icon aria-hidden />
              {chip.label}
              {chip.figure && <span data-part="figure">{chip.figure}</span>}
            </Badge>
          </li>
        );
      })}
    </ul>
  );
}
