import { Gift } from "lucide-react";
import type { Picked } from "@/hooks/use-pick-deal";
import { cn } from "@/lib/utils";
import { GameCover } from "@/components/issue/game-cover";

// The paper name tag hanging off the pick card (surface brief
// challenges-santa-pick, 6A): a luggage tag with clipped top corners and an
// ink eyelet ringed in tinsel, "To" the recipient, a dashed slot that holds
// the pick, and "From: your secret Santa". Once a game is picked, a holly
// "Picked" stamp presses on (again when the pick moves). The tag only shows
// the result; picking happens on the card.
export function NameTag({
  recipient,
  picked,
  className,
}: {
  recipient: string;
  picked: Picked | null;
  className?: string;
}) {
  return (
    <div
      className={cn("relative w-[250px] rotate-4 drop-shadow-[0_14px_30px_rgb(0_0_0/0.55)]", className)}
      aria-live="polite"
    >
      <div className="relative rounded-b-md bg-foreground px-[22px] pt-10 pb-5 text-background [clip-path:polygon(18%_0,82%_0,100%_10%,100%_100%,0_100%,0_10%)]">
        <i
          aria-hidden
          className="absolute top-3.5 left-1/2 size-[13px] -translate-x-1/2 rounded-full bg-background shadow-[0_0_0_3px_var(--color-tinsel)]"
        />
        <span className="font-label text-[0.75rem] font-extrabold tracking-[0.1em] text-slip-muted-foreground">To</span>
        <p className="font-headline mt-1 mb-3 text-[2.125rem] leading-[0.9] break-words">{recipient}</p>
        <div className="flex min-h-[58px] items-center gap-2.5 border-y-[1.5px] border-dashed border-slip-muted-foreground/45 py-2.5">
          {picked ? (
            <>
              <GameCover
                title={picked.title}
                coverUrl={picked.coverUrl}
                className="w-10"
                fallbackClassName="p-0.5 text-[0.5rem]"
              />
              <b className="font-headline line-clamp-3 min-w-0 pr-8 text-[1.375rem] leading-[0.95] font-normal">
                <span className="sr-only">Your pick: </span>
                {picked.title}
              </b>
            </>
          ) : (
            <span className="text-[0.94rem] leading-[1.3] text-slip-muted-foreground italic">Your pick goes here</span>
          )}
        </div>
        <p className="font-label mt-3 flex items-center gap-1.5 text-[0.75rem] font-extrabold tracking-[0.1em] text-slip-muted-foreground">
          <Gift aria-hidden className="size-3.5 text-(--challenge-tint)" />
          From: your secret Santa
        </p>
      </div>
      {picked && (
        <span
          key={picked.gameId}
          aria-hidden
          className="font-headline absolute -right-2 bottom-[58px] motion-reduce:rotate-[-10deg] rounded-[3px] bg-foreground/85 px-[9px] pt-[5px] pb-[3px] text-[1.375rem] leading-none text-(--challenge-tint) shadow-[inset_0_0_0_3px_currentColor] [--burst-rot:-10deg] motion-safe:animate-[burst-stamp_400ms_cubic-bezier(0.16,1,0.3,1)_both]"
        >
          Picked
        </span>
      )}
    </div>
  );
}
