import type { GameKey } from "@/lib/api/types";
import { tagTilt, type KeyBox } from "@/lib/giveaways";
import { GameCover } from "@/components/issue/game-cover";
import { GiftTag } from "@/components/giveaways/gift-tag";
import { cn } from "@/lib/utils";

// One box on the prize shelf: the cover gift-wrapped in its platform's ribbon
// (the shelf sets --p), a ×N sticker when it holds several keys, and its paper
// tag hanging below at the box's own tilt. A box whose keys are all gone greys
// out.
export function GiftBox({
  box,
  open,
  viewerId,
  canClaim,
  canRevokeAny,
  donorName,
  busy,
  disabled,
  onClaim,
}: {
  box: KeyBox;
  // The box's keys still on the shelf.
  open: GameKey[];
  viewerId: string;
  canClaim: boolean;
  canRevokeAny: boolean;
  donorName: string;
  busy: boolean;
  disabled: boolean;
  onClaim: (key: GameKey) => void;
}) {
  const next = open[0];
  const gone = !next;
  const mine = next?.donor_user_id === viewerId;
  const tilt = tagTilt(box.keys[0].key_id);

  return (
    <li className="w-32 shrink-0 snap-start">
      <div className="relative">
        <div className={cn("relative", gone && "brightness-50 grayscale")}>
          <GameCover title={box.title} coverUrl={box.coverUrl} className="w-32" fallbackClassName="text-base" />
          <i aria-hidden className="absolute inset-y-0 left-[72%] w-3.5 bg-(--p)" />
          <i aria-hidden className="absolute inset-x-0 top-[62%] h-3.5 bg-(--p)" />
          <i
            aria-hidden
            className="absolute top-[calc(62%+7px)] left-[calc(72%+7px)] -mt-[15px] -ml-[15px] size-[30px] rotate-45 rounded-[3px] bg-(--p) shadow-[0_3px_6px_rgb(0_0_0/0.45)] after:absolute after:inset-[9px] after:rounded-[2px] after:bg-background/25"
          />
        </div>
        {open.length > 1 && (
          <span className="font-headline absolute -top-2 -right-1.5 rotate-6 rounded-xs bg-foreground px-1.5 py-px text-[0.95rem] text-background shadow-[0_3px_6px_rgb(0_0_0/0.45)]">
            ×{open.length}
          </span>
        )}
      </div>
      <div
        className={cn(
          "relative mt-2.5 mb-[22px] rounded-sm px-[9px] pt-2 pb-[9px] shadow-[0_3px_8px_rgb(0_0_0/0.45)] before:absolute before:-top-1.5 before:left-1/2 before:-ml-1 before:size-2 before:rounded-full before:bg-background before:shadow-[0_0_0_2px_var(--color-foreground)]",
          gone
            ? "bg-muted text-foreground shadow-[inset_0_0_0_1px_var(--color-destructive)]"
            : "bg-foreground text-background",
        )}
        style={{ transform: `rotate(${tilt}deg)` }}
      >
        <GiftTag
          box={box}
          next={next}
          mine={mine}
          canClaim={canClaim}
          canRevokeAny={canRevokeAny}
          donorName={donorName}
          busy={busy}
          disabled={disabled}
          onClaim={onClaim}
        />
      </div>
    </li>
  );
}
