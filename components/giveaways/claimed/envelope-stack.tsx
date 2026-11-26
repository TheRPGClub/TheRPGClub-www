import Link from "next/link";
import type { CSSProperties } from "react";
import type { GameKey } from "@/lib/api/types";
import { platformFamily } from "@/lib/giveaways";
import { WrappedCover } from "@/components/giveaways/wrap/wrapped-cover";
import { cn } from "@/lib/utils";

const MONTH = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });
const DAY = new Intl.DateTimeFormat("en-US", { day: "numeric", timeZone: "UTC" });

// The member's claimed keys as a stack of envelopes made of each platform's
// gift paper, newest on top: the cover tucked in, its title and donor, and a
// postmark with the claim date. The open one is pulled out of the stack.
export function EnvelopeStack({
  keys,
  pickedId,
  names,
}: {
  keys: GameKey[];
  pickedId: number;
  names: Map<string, string>;
}) {
  return (
    <nav aria-label="Your claimed keys">
      <ul className="space-y-1.5">
        {keys.map((k) => {
          const picked = k.key_id === pickedId;
          const ink = platformFamily(k.platform).ink;
          const title = k.game?.title ?? k.game_title;
          const at = k.claimed_at ? new Date(k.claimed_at) : null;
          return (
            <li key={k.key_id}>
              <Link
                href={`/giveaways/claimed?key=${k.key_id}`}
                aria-current={picked ? "true" : undefined}
                style={{ "--p": ink } as CSSProperties}
                className={cn(
                  "gift-paper relative grid grid-cols-[4.5rem_minmax(0,1fr)_auto] items-center gap-4 rounded-sm py-3 pr-4 pl-3 text-background shadow-[0_8px_18px_rgb(0_0_0/0.45)] transition-transform focus-visible:ring-3 focus-visible:ring-highlight/50 focus-visible:outline-none",
                  picked ? "z-10 ring-3 ring-foreground lg:translate-x-3" : "hover:lg:translate-x-1.5",
                )}
              >
                <i aria-hidden className="absolute inset-y-0 right-[5.25rem] w-2 bg-background/85" />
                <WrappedCover title={title} coverUrl={k.game?.cover_url} ink={ink} tied={false} className="w-[4.5rem]" fallbackClassName="text-xs p-1" />
                <span className="min-w-0 pr-3">
                  <span className="font-headline block truncate text-[1.45rem] leading-none">{title}</span>
                  <span className="font-label mt-1.5 block truncate text-[0.74rem] font-extrabold">
                    {k.platform}
                    {k.region !== "Global" ? ` · ${k.region}` : ""} · From {names.get(k.donor_user_id) ?? "a member"}
                  </span>
                </span>
                {at && (
                  <span className="relative grid size-[3.9rem] place-content-center rounded-full border-2 border-background text-center leading-none">
                    <span className="font-label text-[0.62rem] font-extrabold">{MONTH.format(at)}</span>
                    <span className="font-headline text-2xl">{DAY.format(at)}</span>
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
