import Link from "next/link";
import type { AchievementSetProgress } from "@/lib/api/types";
import { progressPercent, setTitle } from "@/lib/achievements";
import type { SetTint } from "@/lib/achievements/tint-color";
import { slotDots, topSetBadge } from "@/lib/member-achievements";
import { cn } from "@/lib/utils";
import { FoilStamp } from "./foil-stamp";
import { ProviderBadge } from "./provider-badge";

// A set's slots as a strip of dots in the game tint, earned first and the
// rest dashed.
export function SlotDots({
  earned,
  total,
  tint,
  className,
}: {
  earned: number;
  total: number;
  tint: string;
  className?: string;
}) {
  const { filled, empty } = slotDots(earned, total);
  return (
    <span aria-hidden className={cn("flex flex-wrap gap-[3px]", className)}>
      {Array.from({ length: filled }, (_, i) => (
        <i key={`f${i}`} className="size-[7px] rounded-full" style={{ background: tint }} />
      ))}
      {Array.from({ length: empty }, (_, i) => (
        <i
          key={`e${i}`}
          className="size-[7px] rounded-full border border-dashed border-faint-foreground/70"
        />
      ))}
    </span>
  );
}

// One set in the binder's index: a game-tint tab past the binder's edge, the
// row number in the tint, the title and Provider chip over the slot dots,
// then the count and a foil stamp once complete, or the percentage. The tab
// starts at the binder's outer edge: the right page and binder paddings
// (18px on phones, 30px from xl) sit between it and the row.
export function BinderIndexRow({
  row,
  number,
  tint,
  href,
}: {
  row: AchievementSetProgress;
  number: number;
  tint: SetTint;
  href: string;
}) {
  const set = row.achievement_set;
  const title = setTitle(set);
  const badge = topSetBadge(row);
  const n = String(number).padStart(2, "0");

  return (
    <li className="group relative flex min-h-[5.25rem] flex-col justify-center gap-2.5 border-b border-border pt-3 pb-4 sm:pb-3">
      <span
        aria-hidden
        className="font-headline absolute top-3 left-full ml-[18px] flex h-12 w-5 items-center justify-end rounded-r-[4px] pr-2 text-[1.2rem] leading-none shadow-[4px_4px_10px_rgb(0_0_0/0.45)] sm:ml-[26px] xl:ml-[30px] xl:h-14 xl:w-[3.25rem]"
        style={{ background: tint.tint, color: tint.contrast }}
      >
        <span className="hidden xl:inline">{n}</span>
      </span>

      <div className="flex min-w-0 items-center gap-2.5">
        <span
          aria-hidden
          className="font-headline w-7 shrink-0 text-[1.15rem] leading-none"
          style={{ color: tint.tint }}
        >
          {n}
        </span>
        <h3 className="font-headline min-w-0 truncate text-[1.25rem] leading-none text-foreground sm:text-[1.5rem]">
          <Link
            href={href}
            className="transition-colors group-hover:text-highlight focus-visible:outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-highlight"
          >
            {title}
          </Link>
        </h3>
        <ProviderBadge provider={set.provider} short className="h-5 shrink-0 px-1.5 text-[0.72rem]" />
        <span className="font-headline ml-auto shrink-0 pl-2 text-[1.25rem] leading-none whitespace-nowrap text-foreground sm:text-[1.5rem]">
          {row.earned_count}
          <span className="text-faint-foreground"> / {row.total_count}</span>
        </span>
        <span className="hidden w-[5.75rem] shrink-0 justify-end sm:flex">
          {badge ? (
            <FoilStamp kind={badge} size="sm" />
          ) : (
            <span className="font-label text-[0.8rem] text-faint-foreground">
              {progressPercent(row)}%
            </span>
          )}
        </span>
      </div>

      <div className="flex items-center gap-3 pl-[2.375rem]">
        <SlotDots
          earned={row.earned_count}
          total={row.total_count}
          tint={tint.tint}
          className="min-w-0 flex-1"
        />
        <span className="shrink-0 sm:hidden">
          {badge ? (
            <FoilStamp kind={badge} size="sm" />
          ) : (
            <span className="font-label text-[0.8rem] text-faint-foreground">
              {progressPercent(row)}%
            </span>
          )}
        </span>
      </div>
      <span className="sr-only">
        {row.earned_count} of {row.total_count} unlocked
        {badge ? `, ${badge}` : ""}
      </span>
    </li>
  );
}
