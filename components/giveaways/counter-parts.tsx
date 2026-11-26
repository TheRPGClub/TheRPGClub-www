import Link from "next/link";
import type { ReactNode } from "react";
import type { GameKey } from "@/lib/api/types";
import { platformFamily } from "@/lib/giveaways";
import { headingLinkClass } from "@/components/templates/page-header";
import { WrappedCover } from "@/components/giveaways/wrap/wrapped-cover";
import { cn } from "@/lib/utils";

// One compartment of the shelf's counter: a label-caps title and count, with
// the link to its own page.
export function CounterSection({
  title,
  count,
  href,
  children,
}: {
  title: string;
  count: string;
  href: string;
  children: ReactNode;
}) {
  return (
    <section aria-label={title} className="min-w-0">
      <div className="mb-2.5 flex items-baseline gap-2.5">
        <h2 className="font-label text-[0.78rem] font-extrabold text-dim-foreground">{title}</h2>
        <span className="font-label text-[0.72rem] text-faint-foreground">{count}</span>
        <Link href={href} className={cn(headingLinkClass, "ml-auto text-xs")}>
          Show all
        </Link>
      </div>
      {children}
    </section>
  );
}

// A small wrapped cover on the counter: tied while the key waits on the
// shelf, its ribbon cut once claimed.
export function MiniGift({
  gameKey,
  href,
  tied,
  caption,
}: {
  gameKey: GameKey;
  href: string;
  tied: boolean;
  caption?: string;
}) {
  const title = gameKey.game?.title ?? gameKey.game_title;
  return (
    <li className="w-[3.25rem]">
      <Link href={href} aria-label={caption ? `${title}: ${caption}` : title} className="block hover:brightness-110">
        <WrappedCover title="" coverUrl={gameKey.game?.cover_url} ink={platformFamily(gameKey.platform).ink} tied={tied} />
      </Link>
      {caption && <p className="font-label mt-1.5 text-[0.66rem] leading-tight text-faint-foreground">{caption}</p>}
    </li>
  );
}
