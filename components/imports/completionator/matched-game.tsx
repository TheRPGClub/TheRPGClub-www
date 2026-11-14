import { RefreshCw } from "lucide-react";
import type { CompletionatorReview } from "@/components/imports/completionator/types";
import { Button } from "@/components/ui/button";

// The game the row was matched to, with the way back to choosing another.
export function MatchedGame({
  game,
  disabled,
  onChange,
}: {
  game: NonNullable<CompletionatorReview["game"]>;
  disabled: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center gap-3.5 rounded-sm px-3 py-2.5 shadow-[inset_0_0_0_2px_var(--color-highlight)]">
      <span className="block h-[3.8rem] w-[2.9rem] shrink-0 overflow-hidden rounded-[2px] bg-background">
        {game.cover_url && (
          // eslint-disable-next-line @next/next/no-img-element -- remote game art from the API's image hosts, which next/image isn't configured for
          <img src={game.cover_url} alt="" className="size-full object-cover" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[0.8rem] text-faint-foreground">Matched to</p>
        <p className="font-label line-clamp-2 text-[1.1rem] leading-[1.05] font-extrabold tracking-[0.02em]">
          {game.title}
        </p>
      </div>
      <Button type="button" size="sm" variant="outline" disabled={disabled} onClick={onChange}>
        <RefreshCw /> Wrong game?
      </Button>
    </div>
  );
}
