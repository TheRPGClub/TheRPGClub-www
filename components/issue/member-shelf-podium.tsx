import type { Game } from "@/lib/api/types";
import { Spine } from "@/components/issue/member-shelf-spine";
import { cn } from "@/lib/utils";

// Favorites' top three stand on a podium: first in the middle and highest,
// second and third either side. Everything after sits on the shelf itself.
const PODIUM_ORDER = [1, 0, 2];
const STEP = ["h-14", "h-10", "h-7"];

export function PodiumSpines({
  items,
}: {
  items: {
    href: string | null;
    game: Game | null | undefined;
    title: string;
    lift?: { hours: string; sub: string | null };
  }[];
}) {
  return (
    <ol className="contents" aria-label="Top three">
      {PODIUM_ORDER.filter((i) => i < items.length).map((i) => {
        const item = items[i];
        return (
          <li
            key={i}
            data-slot="podium-place"
            data-variant={`rank-${i + 1}`}
            className="flex shrink-0 flex-col items-stretch"
          >
            <Spine
              href={item.href}
              game={item.game}
              title={item.title}
              height={206}
              lift={item.lift}
            />
            <span
              data-slot="podium-step"
              className={cn(
                "font-headline grid place-items-center border-t-2 border-foreground bg-muted text-foreground leading-none",
                STEP[i],
                i === 0 ? "text-[1.9rem]" : "text-2xl",
              )}
            >
              <span className="sr-only">Rank </span>
              {i + 1}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
