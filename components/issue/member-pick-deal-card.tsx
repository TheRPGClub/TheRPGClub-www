import Link from "next/link";
import { Check, Hand } from "lucide-react";
import type { BacklogPick } from "@/lib/api/types";
import { MemberCover } from "@/components/issue/member-cover";
import { DealTimes } from "@/components/issue/member-pick-deal-times";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// One dealt card in the hand: cover, title, where it came from, the
// member's note, HowLongToBeat times and the keep button. `seat` places it
// in a full hand of three.
export function DealCard({
  pick,
  on,
  seat,
  onKeep,
}: {
  pick: BacklogPick;
  on: boolean;
  seat: string;
  onKeep: () => void;
}) {
  const game = pick.game;
  const coverGame = {
    ...game,
    cover_url: game.cover_url ?? pick.hltb?.image_url ?? null,
  };
  return (
    <li
      className={cn(
        "flex overflow-hidden rounded-lg border bg-card shadow-[0_18px_40px_rgb(0_0_0/0.5)] transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] sm:row-start-1 sm:flex-col",
        seat,
        on
          ? "border-foreground shadow-[0_0_0_2px_var(--color-foreground),0_22px_44px_rgb(0_0_0/0.55)] sm:-translate-y-3.5 sm:rotate-0"
          : "border-border-strong sm:hover:-translate-y-2",
      )}
    >
      <Link
        href={`/games/${game.game_id}`}
        className="group/cover block w-24 shrink-0 sm:w-auto"
        tabIndex={-1}
        aria-hidden
      >
        <MemberCover
          game={coverGame}
          platform={pick.platform}
          className="rounded-none sm:aspect-[4/4.4]"
          fallbackClassName="text-lg sm:text-3xl"
        />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-2.5 p-3.5 sm:px-4 sm:pt-3.5 sm:pb-4">
        <h2 className="font-headline text-2xl leading-[0.95] text-balance sm:text-[1.9rem]">
          <Link
            href={`/games/${game.game_id}`}
            className="transition-colors hover:text-highlight"
          >
            {game.title}
          </Link>
        </h2>
        <p className="font-label text-[0.75rem] font-bold tracking-[0.06em] text-faint-foreground">
          From your {pick.kind === "backlog" ? "backlog" : "collection"}
          {pick.platform && <> · {pick.platform.platform_name}</>}
        </p>
        {pick.note && (
          <p className="line-clamp-3 text-[0.84rem] text-dim-foreground italic">
            &ldquo;{pick.note}&rdquo;
          </p>
        )}
        <DealTimes pick={pick} />
        <Button
          type="button"
          onClick={onKeep}
          aria-pressed={on}
          variant={on ? "selected" : "outline"}
          className="mt-auto w-full"
        >
          {on ? (
            <Check data-icon="inline-start" />
          ) : (
            <Hand data-icon="inline-start" />
          )}
          {on ? "Kept" : "Keep this one"}
        </Button>
      </div>
    </li>
  );
}
