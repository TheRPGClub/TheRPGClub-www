import Link from "next/link";
import { Plus } from "lucide-react";
import type { GameKey } from "@/lib/api/types";
import { maskKey, platformFamily, shortDate } from "@/lib/giveaways";
import { ButtonLink } from "@/components/ui/button";
import { WrappedCover } from "@/components/giveaways/wrap/wrapped-cover";
import { CounterSection, MiniGift } from "@/components/giveaways/counter-parts";

// The counter along the foot of the shelf (pinned there from md): the
// member's newest claimed key and a few more, their donations still wrapped
// or already given, and Donate a key.
export function CounterStrip({
  claimed,
  donated,
  names,
}: {
  claimed: GameKey[] | null;
  donated: GameKey[] | null;
  names: Record<string, string>;
}) {
  const [newest, ...older] = claimed ?? [];
  return (
    <aside
      aria-label="Your giveaways"
      className="bleed z-20 mt-10 grid gap-x-8 gap-y-6 border-t-2 border-foreground bg-card px-4 py-4 sm:px-7 md:sticky md:bottom-0 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_minmax(0,0.85fr)]"
    >
      <CounterSection title="Your keys" count={claimed ? `${claimed.length} claimed` : ""} href="/giveaways/claimed">
        {claimed === null ? (
          <p className="text-sm text-faint-foreground">{"Couldn't load your claimed keys."}</p>
        ) : !newest ? (
          <p className="text-sm text-faint-foreground">Nothing claimed yet. Pick a present.</p>
        ) : (
          <div className="flex items-center gap-4">
            <Link href={`/giveaways/claimed?key=${newest.key_id}`} className="flex min-w-0 items-center gap-3 hover:text-highlight">
              <WrappedCover
                title=""
                coverUrl={newest.game?.cover_url}
                ink={platformFamily(newest.platform).ink}
                tied={false}
                className="w-14"
              />
              <span className="min-w-0">
                <span className="font-headline block truncate text-xl leading-none">
                  {newest.game?.title ?? newest.game_title}
                </span>
                <span className="font-label mt-1 block text-[0.72rem] text-faint-foreground">
                  {newest.platform} · {shortDate(newest.claimed_at)}
                </span>
                {newest.key_value && (
                  <code className="font-label mt-1 block text-sm tracking-[0.12em] text-dim-foreground normal-case">
                    {maskKey(newest.key_value)}
                  </code>
                )}
              </span>
            </Link>
            <ul className="ml-auto hidden gap-2 sm:flex">
              {older.slice(0, 3).map((k) => (
                <MiniGift key={k.key_id} gameKey={k} href={`/giveaways/claimed?key=${k.key_id}`} tied={false} />
              ))}
            </ul>
          </div>
        )}
      </CounterSection>
      <CounterSection title="Your donations" count={donated ? String(donated.length) : ""} href="/giveaways/donate">
        {donated === null ? (
          <p className="text-sm text-faint-foreground">{"Couldn't load your donations."}</p>
        ) : donated.length === 0 ? (
          <p className="text-sm text-faint-foreground">{"You haven't donated a key yet."}</p>
        ) : (
          <ul className="flex gap-2.5">
            {donated.slice(0, 4).map((k) => (
              <MiniGift
                key={k.key_id}
                gameKey={k}
                href="/giveaways/donate"
                tied={!k.claimed_by_user_id}
                caption={k.claimed_by_user_id ? `To ${names[k.claimed_by_user_id] ?? "a member"}` : "On the shelf"}
              />
            ))}
          </ul>
        )}
      </CounterSection>
      <section aria-labelledby="counter-donate">
        <h2 id="counter-donate" className="font-label text-[0.78rem] font-extrabold text-dim-foreground">
          Got a spare key?
        </h2>
        <p className="mt-1.5 mb-3 text-sm text-dim-foreground">
          Wrap it for the shelf. A member claims it and the bot DMs it to them.
        </p>
        <ButtonLink href="/giveaways/donate" variant="highlight">
          <Plus data-icon="inline-start" />
          Donate a key
        </ButtonLink>
      </section>
    </aside>
  );
}
