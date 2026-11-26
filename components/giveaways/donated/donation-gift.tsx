import Link from "next/link";
import type { CSSProperties } from "react";
import { Undo2 } from "lucide-react";
import type { GameKey } from "@/lib/api/types";
import { platformFamily, shelfAge, shortDate } from "@/lib/giveaways";
import { Button } from "@/components/ui/button";
import { PlatformChip } from "@/components/giveaways/platform-chip";
import { RevokeKeyDialog } from "@/components/giveaways/revoke-key-dialog";
import { WrappedCover } from "@/components/giveaways/wrap/wrapped-cover";
import { cn } from "@/lib/utils";

// One of the member's donations: wrapped and tied while it waits on the shelf
// (Take back, after a confirm); greyed with its ribbon cut once claimed, with
// who claimed it and when.
export function DonationGift({ gameKey: k, claimerName }: { gameKey: GameKey; claimerName: string }) {
  const title = k.game?.title ?? k.game_title;
  const claimed = Boolean(k.claimed_by_user_id);
  const ink = platformFamily(k.platform).ink;
  return (
    <li className="min-w-0">
      <div style={{ "--p": ink } as CSSProperties}>
        <WrappedCover
          title={title}
          coverUrl={k.game?.cover_url}
          ink={ink}
          tied={!claimed}
          className={cn(
            "w-full transition-[filter,opacity] duration-300",
            claimed ? "opacity-60 grayscale hover:opacity-90" : "shadow-[0_12px_30px_rgb(0_0_0/0.5)]",
          )}
        >
          <span className="absolute top-2 left-2 rounded-xs shadow-[0_0_0_2px_rgb(11_11_13/0.45)]">
            <PlatformChip ink={ink}>
              {k.platform}
              {k.region !== "Global" ? ` · ${k.region}` : ""}
            </PlatformChip>
          </span>
        </WrappedCover>
      </div>
      <div className={cn("mt-3.5 flex items-start gap-3 max-sm:flex-col max-sm:items-stretch max-sm:gap-2", claimed && "opacity-70")}>
        <div className="min-w-0 flex-1">
          <p className="font-headline text-[1.15rem] leading-[0.95] text-balance">
            {k.game ? (
              <Link href={`/games/${k.game.game_id}`} className="hover:text-highlight">
                {title}
              </Link>
            ) : (
              title
            )}
          </p>
          <p className="font-label mt-1 text-[0.74rem] text-faint-foreground">
            {claimed ? `To ${claimerName} · ${shortDate(k.claimed_at)}` : `On the shelf · ${shelfAge(k.created_at)}`}
          </p>
        </div>
        {!claimed && (
          <RevokeKeyDialog
            gameKey={k}
            title={title}
            mine
            trigger={
              <Button variant="destructive-outline" size="sm">
                <Undo2 aria-hidden />
                Take back
              </Button>
            }
          />
        )}
      </div>
    </li>
  );
}
