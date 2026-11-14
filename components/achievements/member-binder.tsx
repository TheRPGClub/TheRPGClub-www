import Link from "next/link";
import type {
  AchievementProvider,
  AchievementSetProgress,
  AchievementTotals,
  LinkedAccountSummary,
} from "@/lib/api/types";
import { progressPercent, setTitle } from "@/lib/achievements";
import type { SetTint } from "@/lib/achievements/tint-color";
import { slotDots, topSetBadge, totalStats } from "@/lib/member-achievements";
import { cn } from "@/lib/utils";
import { FoilStamp } from "./foil-stamp";
import { ProviderBadge } from "./provider-badge";

// The pieces of a member's binder (the member achievements page and the
// profile's Achievements section): the totals, the Linked Account chips,
// and the index rows of sets with their game-tint tabs.

// The totals: Unlocks as the monumental numeral, then Completions,
// Masteries, Platinums and RA points (the last three only where a Linked
// Account or an earned one makes them mean something; see totalStats).
export function BinderTotals({
  totals,
  linked,
  className,
}: {
  totals: AchievementTotals;
  linked: AchievementProvider[];
  className?: string;
}) {
  const [lead, ...rest] = totalStats(totals, linked);
  const label = (s: typeof lead) => (s.value === 1 ? s.label[0] : s.label[1]);
  return (
    <dl className={cn("flex flex-col gap-5", className)}>
      <div className="flex items-end gap-3">
        <dd className="font-headline text-[4.5rem] leading-[0.8] text-foreground sm:text-[5.25rem]">
          {lead.value.toLocaleString("en-US")}
        </dd>
        <dt className="font-label max-w-[7ch] pb-0.5 text-[1rem] leading-[1.1] text-dim-foreground">
          {label(lead)}
        </dt>
      </div>
      {rest.length > 0 && (
        <div className="grid grid-cols-4 gap-x-3 gap-y-4">
          {rest.map((stat) => (
            <div key={stat.key} className="flex flex-col-reverse gap-1.5">
              <dt className="font-label max-w-[9ch] text-[0.74rem] leading-[1.1] tracking-[0.08em] text-faint-foreground">
                {label(stat)}
              </dt>
              <dd className="font-headline text-[2rem] leading-[0.8] text-foreground">
                {stat.value.toLocaleString("en-US")}
              </dd>
            </div>
          ))}
        </div>
      )}
    </dl>
  );
}

// Linked Accounts as solid Provider chips carrying the member's name there.
export function LinkedAccountChips({
  accounts,
  className,
}: {
  accounts: LinkedAccountSummary[];
  className?: string;
}) {
  if (accounts.length === 0) return null;
  return (
    <ul aria-label="Linked Accounts" className={cn("flex flex-col items-start gap-1.5", className)}>
      {accounts.map((account) => (
        <li key={account.provider} className="max-w-full">
          <ProviderBadge
            provider={account.provider}
            short
            name={account.display_name}
            className="max-w-full"
          />
        </li>
      ))}
    </ul>
  );
}

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

// The binder's rings down the gutter between the two pages.
export function BinderRings({ count }: { count: number }) {
  return (
    <div aria-hidden className="hidden flex-col items-center justify-around py-16 xl:flex">
      {Array.from({ length: count }, (_, i) => (
        <i
          key={i}
          className="h-4 w-[30px] rounded-[9px] border-[3px] border-[#9a9aa2] bg-card shadow-[inset_0_2px_0_rgb(0_0_0/0.5),0_2px_4px_rgb(0_0_0/0.6)]"
        />
      ))}
    </div>
  );
}
