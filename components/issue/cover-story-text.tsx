import type { VotingCategory } from "@/lib/api/types";
import type { gotmCardProps } from "@/components/gotm-card";
import { PlatformPills } from "@/components/platform-pills";
import { Badge } from "@/components/ui/badge";
import {
  TITLE_SIZE,
  TRACK,
  splitTitle,
  type PanelSize,
} from "@/components/issue/cover-track";
import { cn } from "@/lib/utils";

// A cover panel's story: the co-winner's letter beside the headline, the
// year and platform chips, then the blurb (left out on the smallest panels).
export function CoverStoryText({
  kind,
  game,
  index,
  count,
  size,
}: {
  kind: VotingCategory;
  game: ReturnType<typeof gotmCardProps>;
  index: number;
  count: number;
  size: PanelSize;
}) {
  const track = TRACK[kind];
  const [first, second] = splitTitle(game.title);
  const small = size === "s";
  const single = count === 1;

  return (
    <>
      <div className="flex items-start gap-3">
        {count > 1 && (
          <p
            aria-label={`Winner ${"ABC"[index]}`}
            data-slot="cover-winner-letter"
            data-track={kind}
            className={cn(
              "font-headline mt-1 grid shrink-0 place-items-center rounded-xs leading-none",
              small ? "size-9 text-[1.6rem]" : "size-11 text-[2rem]",
              track.tag,
            )}
          >
            {"ABC"[index]}
          </p>
        )}
        <h2
          data-slot="cover-headline"
          data-track={kind}
          className={cn(
            "font-headline min-w-0 text-balance",
            TITLE_SIZE[size],
            single && "max-w-[11ch]",
          )}
        >
          {first && <span data-slot="cover-headline-first" className="block">{first}</span>}
          <span data-slot="cover-headline-second" className={cn("block", track.accent)}>{second}</span>
        </h2>
      </div>

      <div className={cn("flex flex-wrap gap-1.5", small ? "mt-2.5" : "mt-3.5")}>
        {game.year && <Badge className="border-0">{game.year}</Badge>}
        <PlatformPills platforms={game.platforms} max={small ? 2 : 4} />
      </div>

      {!small && game.description && (
        <p
          data-slot="cover-blurb"
          className={cn(
            "mt-3 line-clamp-3 text-dim-foreground",
            single ? "max-w-[52ch] text-[0.97rem]" : "max-w-[46ch] text-sm",
            // Side-by-side co-winners reserve the clamp's three lines,
            // so the story blocks end level and the stats and actions
            // line up across the split.
            count === 2 && "sm:min-h-[3lh]",
          )}
        >
          {game.description}
        </p>
      )}
    </>
  );
}
