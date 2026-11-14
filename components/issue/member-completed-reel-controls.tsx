import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { Game } from "@/lib/api/types";
import { Button, ButtonLink } from "@/components/ui/button";

// The spotlight's corner: step through the page's completions, where the
// selected one sits in the whole list, and its game.
export function ReelControls({
  count,
  position,
  total,
  game,
  onStep,
}: {
  // Completions on this page.
  count: number;
  // The selected completion's place in the whole filtered list (1-based).
  position: number;
  total: number;
  game: Game | null | undefined;
  onStep: (delta: number) => void;
}) {
  return (
    <div className="flex items-center gap-2 sm:col-span-2 xl:col-span-1 xl:flex-col xl:items-end">
      {count > 1 && (
        <div className="flex items-center gap-1.5">
          <Button
            variant="step"
            size="icon"
            onClick={() => onStep(-1)}
            aria-label="Previous completion"
            className="grid size-10.5 place-items-center"
          >
            <ChevronLeft aria-hidden className="size-4.5" />
          </Button>
          <Button
            variant="step"
            size="icon"
            onClick={() => onStep(1)}
            aria-label="Next completion"
            className="grid size-10.5 place-items-center"
          >
            <ChevronRight aria-hidden className="size-4.5" />
          </Button>
        </div>
      )}
      <p className="font-label text-[0.82rem] font-extrabold tracking-[0.1em] text-faint-foreground">
        <b className="text-foreground">{position}</b> of {total}
      </p>
      {game && (
        <ButtonLink
          href={`/games/${game.game_id}`}
          variant="overlay"
          className="ml-auto xl:ml-0"
        >
          View game
          <ArrowRight data-icon="inline-end" />
        </ButtonLink>
      )}
    </div>
  );
}
