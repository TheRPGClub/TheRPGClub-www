"use client";

import Link from "next/link";
import { Undo2 } from "lucide-react";
import type { GameKey } from "@/lib/api/types";
import { platformFamily, shelfAge, shortDate } from "@/lib/giveaways";
import { Button } from "@/components/ui/button";
import { PlatformChip } from "@/components/giveaways/platform-chip";
import { RevokeKeyDialog } from "@/components/giveaways/revoke-key-dialog";
import { WrappedCover } from "@/components/giveaways/wrap/wrapped-cover";
import { cn } from "@/lib/utils";

// The member's donations, newest first: each still wrapped while it waits on
// the shelf (and can be taken back, after a confirm), its ribbon cut once a
// member claims it. Three dots track it: donated, on the shelf, claimed.
export function DonationList({ keys, names }: { keys: GameKey[]; names: Record<string, string> }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {keys.map((k) => {
        const title = k.game?.title ?? k.game_title;
        const claimed = Boolean(k.claimed_by_user_id);
        const ink = platformFamily(k.platform).ink;
        return (
          <li key={k.key_id} className="relative flex gap-4 rounded-md border border-border bg-card p-4 pb-14">
            <WrappedCover title="" coverUrl={k.game?.cover_url} ink={ink} tied={!claimed} className="w-[4.75rem]" />
            <div className="min-w-0 flex-1">
              <p className="font-headline text-[1.3rem] leading-[0.95] text-balance">
                {k.game ? (
                  <Link href={`/games/${k.game.game_id}`} className="hover:text-highlight">
                    {title}
                  </Link>
                ) : (
                  title
                )}
              </p>
              <div className="mt-2">
                <PlatformChip ink={ink}>
                  {k.platform}
                  {k.region !== "Global" ? ` · ${k.region}` : ""}
                </PlatformChip>
              </div>
              <div aria-hidden className="mt-3 flex items-center">
                {[true, true, claimed].map((on, i) => (
                  <span key={i} className={cn("flex items-center", i > 0 && "flex-1")}>
                    {i > 0 && <i className={cn("h-0.5 flex-1", on ? "bg-foreground" : "bg-border-strong")} />}
                    <i className={cn("size-2.5 rounded-full border-2", on ? "border-foreground bg-foreground" : "border-faint-foreground")} />
                  </span>
                ))}
              </div>
              <p className="font-label mt-1.5 text-[0.74rem] font-bold">
                {claimed
                  ? `Claimed by ${names[k.claimed_by_user_id ?? ""] ?? "a member"} · ${shortDate(k.claimed_at)}`
                  : `On the shelf · since ${shelfAge(k.created_at)}`}
              </p>
            </div>
            {!claimed && (
              <RevokeKeyDialog
                gameKey={k}
                title={title}
                mine
                trigger={
                  <Button variant="destructive-outline" size="sm" className="absolute right-4 bottom-4 gap-1.5">
                    <Undo2 aria-hidden className="size-3.5" />
                    Take back
                  </Button>
                }
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}
