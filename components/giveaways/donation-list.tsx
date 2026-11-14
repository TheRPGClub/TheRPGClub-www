"use client";

import Link from "next/link";
import { Undo2 } from "lucide-react";
import type { GameKey } from "@/lib/api/types";
import { platformFamily, shelfAge, shortDate } from "@/lib/giveaways";
import { GameCover } from "@/components/issue/game-cover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlatformChip } from "@/components/giveaways/platform-chip";
import { RevokeKeyDialog } from "@/components/giveaways/revoke-key-dialog";

// The member's donations, newest first. An unclaimed key can be revoked,
// after a confirm.
export function DonationList({ keys, names }: { keys: GameKey[]; names: Record<string, string> }) {
  return (
    <ul>
      {keys.map((k) => {
        const title = k.game?.title ?? k.game_title;
        const claimed = Boolean(k.claimed_by_user_id);
        return (
          <li
            key={k.key_id}
            className="grid grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 border-b border-border py-3 sm:grid-cols-[52px_minmax(0,1fr)_auto_auto]"
          >
            <GameCover title="" coverUrl={k.game?.cover_url} className="w-[52px]" />
            <div className="min-w-0">
              <p className="font-headline text-[1.2rem] leading-[0.95]">
                {k.game ? (
                  <Link href={`/games/${k.game.game_id}`} className="hover:text-highlight">
                    {title}
                  </Link>
                ) : (
                  title
                )}
              </p>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-[0.84rem] text-faint-foreground">
                <PlatformChip ink={platformFamily(k.platform).ink}>{k.platform}</PlatformChip>
                {k.region !== "Global" && <span>{k.region}</span>}
                {claimed ? (
                  <span>
                    Claimed by <b className="text-foreground">{names[k.claimed_by_user_id ?? ""] ?? "a member"}</b>{" "}
                    {shortDate(k.claimed_at)}
                  </span>
                ) : (
                  <span>Put up {shelfAge(k.created_at)}</span>
                )}
              </p>
            </div>
            <Badge tone={claimed ? "highlight" : "neutral"} className="justify-self-end border-0">
              {claimed ? "Claimed" : "Unclaimed"}
            </Badge>
            {!claimed ? (
              <RevokeKeyDialog
                gameKey={k}
                title={title}
                mine
                trigger={
                  <Button
                    variant="destructive-outline"
                    size="sm"
                    className="col-span-3 gap-1.5 justify-self-end text-[0.82rem] sm:col-span-1"
                  >
                    <Undo2 aria-hidden className="size-3.5" />
                    Revoke
                  </Button>
                }
              />
            ) : (
              <span className="hidden sm:block" />
            )}
          </li>
        );
      })}
    </ul>
  );
}
