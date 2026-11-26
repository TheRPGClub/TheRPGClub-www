import type { CSSProperties } from "react";
import type { GameKey } from "@/lib/api/types";
import { platformFamily, type KeyBox } from "@/lib/giveaways";
import { PlatformChip } from "@/components/giveaways/platform-chip";
import { GiftTag } from "@/components/giveaways/gift-tag";
import { WrappedCover } from "@/components/giveaways/wrap/wrapped-cover";
import { cn } from "@/lib/utils";

// One present on the shelf: the game's whole cover tied in its platform's
// ribbon, a stack of gift paper behind it when it holds several keys, and
// its name, donor and Claim under it. A box whose keys are all gone greys out.
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
  const ink = platformFamily(box.platform).ink;
  const region = box.region !== "Global" ? ` · ${box.region}` : "";

  return (
    <li className="min-w-0">
      <div className="relative" style={{ "--p": ink } as CSSProperties}>
        {open.length > 2 && (
          <i aria-hidden className="gift-paper absolute inset-0 translate-x-3 -translate-y-3 rounded-sm brightness-75" />
        )}
        {open.length > 1 && (
          <i aria-hidden className="gift-paper absolute inset-0 translate-x-1.5 -translate-y-1.5 rounded-sm brightness-90" />
        )}
        <WrappedCover
          title={box.title}
          coverUrl={box.coverUrl}
          ink={ink}
          className={cn("w-full shadow-[0_12px_30px_rgb(0_0_0/0.5)]", !next && "brightness-50 grayscale")}
          fallbackClassName="text-xl"
        >
          <span className="absolute top-2 left-2 rounded-xs shadow-[0_0_0_2px_rgb(11_11_13/0.45)]">
            <PlatformChip ink={ink}>
              {box.platform}
              {region}
            </PlatformChip>
          </span>
          {open.length > 1 && (
            <span className="font-headline absolute bottom-2 left-2 rounded-xs bg-background px-1.5 py-px text-lg text-foreground">
              ×{open.length}
            </span>
          )}
        </WrappedCover>
      </div>
      <GiftTag
        box={box}
        next={next}
        mine={next?.donor_user_id === viewerId}
        canClaim={canClaim}
        canRevokeAny={canRevokeAny}
        donorName={donorName}
        busy={busy}
        disabled={disabled}
        onClaim={onClaim}
      />
    </li>
  );
}
