"use client";

import { Fragment, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TriangleAlert, Undo2 } from "lucide-react";
import { revokeKeyAction } from "@/app/actions/giveaways";
import type { GameKey } from "@/lib/api/types";
import { platformFamily, shelfAge, shortDate } from "@/lib/giveaways";
import { GameCover } from "@/components/issue/game-cover";
import { Chip } from "@/components/issue/chip";
import { PlatformChip } from "@/components/giveaways/platform-chip";

const REVOKE_OUTLINE =
  "font-label inline-flex h-7 items-center gap-1.5 rounded-sm px-2.5 text-[0.82rem] font-extrabold text-destructive shadow-[inset_0_0_0_1px_var(--color-destructive)] hover:bg-destructive/10 disabled:opacity-50";

// The member's donations, newest first. An unclaimed key can be revoked,
// after a confirm row under it.
export function DonationList({ keys, names }: { keys: GameKey[]; names: Record<string, string> }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const revoke = (id: number) => {
    setError(null);
    startTransition(async () => {
      const result = await revokeKeyAction(id);
      if (!result.ok) {
        setError(result.error ?? "Couldn't take that key off the shelf.");
        return;
      }
      setConfirming(null);
      router.refresh();
    });
  };

  return (
    <div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
      <ul>
        {keys.map((k) => {
          const title = k.game?.title ?? k.game_title;
          const claimed = Boolean(k.claimed_by_user_id);
          return (
            <Fragment key={k.key_id}>
              <li className="grid grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 border-b border-rule py-3 sm:grid-cols-[52px_minmax(0,1fr)_auto_auto]">
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
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-[0.84rem] text-paper-mute">
                    <PlatformChip ink={platformFamily(k.platform).ink}>{k.platform}</PlatformChip>
                    {k.region !== "Global" && <span>{k.region}</span>}
                    {claimed ? (
                      <span>
                        Claimed by <b className="text-paper">{names[k.claimed_by_user_id ?? ""] ?? "a member"}</b>{" "}
                        {shortDate(k.claimed_at)}
                      </span>
                    ) : (
                      <span>On the shelf since {shelfAge(k.created_at)}</span>
                    )}
                  </p>
                </div>
                <Chip tone={claimed ? "highlight" : "neutral"} className="justify-self-end">
                  {claimed ? "Claimed" : "Unclaimed"}
                </Chip>
                {!claimed ? (
                  <button
                    type="button"
                    className={`${REVOKE_OUTLINE} col-span-3 justify-self-end sm:col-span-1`}
                    onClick={() => setConfirming(k.key_id)}
                    aria-expanded={confirming === k.key_id}
                  >
                    <Undo2 aria-hidden className="size-3.5" />
                    Revoke
                  </button>
                ) : (
                  <span className="hidden sm:block" />
                )}
              </li>
              {confirming === k.key_id && (
                <li className="my-1.5 flex flex-wrap items-center gap-3 rounded-md bg-ink-2 px-3.5 py-3 text-sm shadow-[inset_0_0_0_1px_var(--color-destructive)]">
                  <TriangleAlert aria-hidden className="size-4 text-destructive" />
                  <span>Take {title} off the shelf? The key comes back to you.</span>
                  <span className="ml-auto flex gap-2">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => revoke(k.key_id)}
                      className="font-label inline-flex h-7 items-center rounded-sm bg-destructive px-2.5 text-[0.82rem] font-extrabold text-ink disabled:opacity-50"
                    >
                      {isPending ? "Revoking…" : "Revoke key"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirming(null)}
                      className="font-label inline-flex h-7 items-center rounded-sm px-2 text-[0.82rem] font-extrabold text-paper-dim hover:text-paper"
                    >
                      Keep it
                    </button>
                  </span>
                </li>
              )}
            </Fragment>
          );
        })}
      </ul>
    </div>
  );
}
