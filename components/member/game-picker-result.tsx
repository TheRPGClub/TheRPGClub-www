import type { Game } from "@/lib/api/types";
import { ComboboxItem } from "@/components/ui/combobox";

// One GameDB match in the game picker's list: its cover, title, year and
// first platforms, and a Pick tag that fills yellow while the row is lit.
export function GamePickerResult({ game }: { game: Game }) {
  const year = game.initial_release_date ? new Date(game.initial_release_date).getFullYear() : null;
  const platforms = (game.platforms ?? [])
    .slice(0, 3)
    .map((p) => p.platform_abbreviation ?? p.platform_name);
  return (
    <ComboboxItem
      value={game}
      variant="result"
      className="group/result grid grid-cols-[2.1rem_1fr_auto] gap-3 px-2.5 py-2 text-left"
    >
      <span className="block h-11 w-[2.1rem] overflow-hidden rounded-[2px] bg-card">
        {game.cover_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={game.cover_url} alt="" className="size-full object-cover" />
        )}
      </span>
      <span className="min-w-0">
        <span className="block truncate font-semibold">{game.title}</span>
        {(year || platforms.length > 0) && (
          <span className="block truncate text-xs text-faint-foreground">
            {[year, ...platforms].filter(Boolean).join(" · ")}
          </span>
        )}
      </span>
      <span className="font-label rounded-xs border border-border-strong px-2 py-0.5 text-[0.75rem] font-extrabold tracking-[0.08em] text-dim-foreground transition-colors group-data-highlighted/result:border-highlight group-data-highlighted/result:bg-highlight group-data-highlighted/result:text-highlight-foreground">
        Pick
      </span>
    </ComboboxItem>
  );
}
