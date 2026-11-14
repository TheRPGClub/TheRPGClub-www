import type { ReactNode } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { GameKey } from "@/lib/api/types";
import { shortDate } from "@/lib/giveaways";
import { GameCover } from "@/components/issue/game-cover";
import { headingLinkClass } from "@/components/templates/page-header";
import { cn } from "@/lib/utils";

// The shelf's right rail: the yellow donate panel over the member's own
// claimed keys and donations, each a short list that opens its own page.

export function DonatePanel({ canClaimCopy }: { canClaimCopy: string }) {
  return (
    <div className="rounded-md bg-highlight p-5 text-ink">
      <h2 className="font-headline text-[1.9rem] leading-[0.9]">Got a spare key?</h2>
      <p className="mt-2 mb-3.5 text-sm text-highlight-ink">{canClaimCopy}</p>
      <Link
        href="/giveaways/donate"
        className="font-label inline-flex h-9 items-center gap-2 rounded-sm bg-ink px-3.5 text-[0.95rem] font-extrabold text-paper transition-colors hover:bg-ink-3 focus-visible:ring-3 focus-visible:ring-ink/40 focus-visible:outline-none"
      >
        <Plus aria-hidden className="size-4" />
        Donate a key
      </Link>
    </div>
  );
}

function MiniList({
  title,
  count,
  href,
  linkLabel,
  empty,
  children,
}: {
  title: string;
  count: string;
  href: string;
  linkLabel: string;
  empty: string | null;
  children: ReactNode;
}) {
  return (
    <section aria-label={title}>
      <div className="flex items-baseline gap-3 border-b-2 border-paper pb-2">
        <h2 className="font-headline text-xl">{title}</h2>
        <span className="font-label text-xs text-paper-mute">{count}</span>
        <Link href={href} className={cn(headingLinkClass, "ml-auto text-xs")}>
          {linkLabel}
        </Link>
      </div>
      {empty ? <p className="py-3 text-sm text-paper-mute">{empty}</p> : <ul>{children}</ul>}
    </section>
  );
}

function MiniRow({ gameKey, line }: { gameKey: GameKey; line: string }) {
  const title = gameKey.game?.title ?? gameKey.game_title;
  return (
    <li className="flex items-center gap-3 border-b border-rule py-2.5">
      <GameCover title="" coverUrl={gameKey.game?.cover_url} className="w-[38px]" />
      <div className="min-w-0">
        <p className="truncate text-[0.95rem] leading-tight font-semibold">{title}</p>
        <p className="text-xs text-paper-mute">{line}</p>
      </div>
    </li>
  );
}

export function ClaimedMini({ keys }: { keys: GameKey[] | null }) {
  const shown = (keys ?? []).slice(0, 3);
  return (
    <MiniList
      title="Your claimed keys"
      count={keys ? String(keys.length) : ""}
      href="/giveaways/claimed"
      linkLabel="Show keys"
      empty={keys === null ? "Couldn't load your claimed keys." : keys.length === 0 ? "Nothing claimed yet." : null}
    >
      {shown.map((k) => (
        <MiniRow key={k.key_id} gameKey={k} line={`${k.platform} · claimed ${shortDate(k.claimed_at)}`} />
      ))}
    </MiniList>
  );
}

export function DonationsMini({ keys }: { keys: GameKey[] | null }) {
  const unclaimed = (keys ?? []).filter((k) => !k.claimed_by_user_id);
  const shown = (keys ?? []).slice(0, 3);
  return (
    <MiniList
      title="Your donations"
      count={keys ? `${unclaimed.length} on the shelf` : ""}
      href="/giveaways/donate"
      linkLabel="Manage"
      empty={keys === null ? "Couldn't load your donations." : keys.length === 0 ? "You haven't donated a key yet." : null}
    >
      {shown.map((k) => (
        <MiniRow
          key={k.key_id}
          gameKey={k}
          line={`${k.platform} · ${k.claimed_by_user_id ? `claimed ${shortDate(k.claimed_at)}` : "unclaimed"}`}
        />
      ))}
    </MiniList>
  );
}
