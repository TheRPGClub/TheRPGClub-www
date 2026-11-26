import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { GameKey } from "@/lib/api/types";
import {
  maskKey,
  platformFamily,
  redeemLink,
  shortDate,
} from "@/lib/giveaways";
import { WrappedCover } from "@/components/giveaways/wrap/wrapped-cover";

// The member's newest claimed key on the shelf's counter: its unwrapped
// cover, title, platform and date, the key masked, and the platform's Redeem.
export function NewestKey({ gameKey }: { gameKey: GameKey }) {
  const redeem = gameKey.key_value
    ? redeemLink(gameKey.platform, gameKey.key_value)
    : null;
  return (
    <div className="min-w-0 flex-1">
      <Link
        href={`/giveaways/claimed?key=${gameKey.key_id}`}
        className="flex min-w-0 items-center gap-3 hover:text-highlight"
      >
        <WrappedCover
          title=""
          coverUrl={gameKey.game?.cover_url}
          ink={platformFamily(gameKey.platform).ink}
          tied={false}
          className="w-14"
        />
        <span className="min-w-0">
          <span className="font-headline block truncate text-xl leading-none">
            {gameKey.game?.title ?? gameKey.game_title}
          </span>
          <span className="font-label mt-1 block text-[0.72rem] text-faint-foreground">
            {gameKey.platform} · {shortDate(gameKey.claimed_at)}
          </span>
          {gameKey.key_value && (
            <code className="mt-1 block truncate font-sans text-sm tracking-[0.1em] text-dim-foreground">
              {maskKey(gameKey.key_value)}
            </code>
          )}
        </span>
      </Link>
      {redeem && (
        <a
          href={redeem.href}
          target="_blank"
          rel="noreferrer"
          className="font-label mt-1.5 ml-[4.25rem] inline-flex items-center text-xs font-extrabold text-foreground underline decoration-gotm decoration-2 underline-offset-4 hover:text-highlight"
        >
          {redeem.label}
          <ExternalLink aria-hidden className="ml-1 inline size-3" />
        </a>
      )}
    </div>
  );
}
