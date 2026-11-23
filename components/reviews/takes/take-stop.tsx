import type { ReviewAccent } from "@/lib/reviews/accent";
import { editRuleDate } from "@/lib/reviews/edit-rules";
import { scoreChange, stopDate, type Take } from "@/lib/reviews/takes";
import { cn } from "@/lib/utils";

// The current take's marks in the game's track ink: the dot on the spine and
// the "· now" label. Paper for a game that won neither track.
export const NOW_DOT: Record<ReviewAccent, string> = {
  brand: "bg-gotm",
  purple: "bg-nr",
  neutral: "bg-foreground",
};
export const NOW_LABEL: Record<ReviewAccent, string> = {
  brand: "text-gotm-soft",
  purple: "text-nr-soft",
  neutral: "text-foreground",
};

// Where the spine runs: the stop column is 150px (190px from xl), with the
// spine 20px past it.
export const SPINE_LINE = "left-[169px] xl:left-[209px]";

const LABEL = "font-label font-extrabold tracking-[0.08em] uppercase";

// A take's stop on the score line: its date as a big numeral with the month
// under it, which take it is, its score box and how the score changed, then
// the author's controls. On a phone the spine folds into a ruled date row
// above the take (date, marker, score box) with the change under it.
export function TakeStop({
  take,
  accent,
  controls,
}: {
  take: Take;
  accent: ReviewAccent;
  controls?: React.ReactNode;
}) {
  const { day, month } = stopDate(take.publishedAt);
  const label = `${take.label}${take.current ? " · now" : ""}`;
  const change = scoreChange(take.rating, take.previousRating);
  const box = cn(
    "font-headline grid place-items-center rounded-[3px] leading-none",
    take.current ? "bg-foreground text-background" : "text-dim-foreground shadow-[inset_0_0_0_2px_color-mix(in_oklab,var(--color-foreground)_50%,transparent)]",
  );
  return (
    <>
      <div className="relative hidden pr-1 text-right md:block">
        <span
          aria-hidden
          className={cn("absolute top-1.5 -right-[27px] z-1 size-3.5 rounded-[2px]", take.current ? NOW_DOT[accent] : "bg-foreground")}
        />
        <span className="font-headline block text-[2.9rem] leading-[0.85]">{day}</span>
        <span className={cn(LABEL, "mt-1.5 block text-[0.82rem] text-dim-foreground")}>{month}</span>
        <span className={cn(LABEL, "mt-3.5 block text-[0.74rem] leading-[1.4]", take.current ? NOW_LABEL[accent] : "text-faint-foreground")}>
          {label}
        </span>
        <span aria-label={take.rating === null ? "Not scored" : `Scored ${take.rating}`} className={cn(box, "mt-2.5 inline-grid size-16 text-[2.6rem]")}>
          {take.rating ?? "—"}
        </span>
        <span className={cn(LABEL, "mt-1.5 block text-[0.74rem] leading-[1.4] tracking-[0.06em] text-faint-foreground")}>{change}</span>
        {controls && <div className="mt-3 flex flex-col items-end gap-0.5">{controls}</div>}
      </div>

      <div className="md:hidden">
        <div className="flex items-center gap-2.5 border-t-2 border-b border-t-foreground border-b-border py-2.5">
          <span aria-hidden className={cn("size-3 rounded-[2px]", take.current ? NOW_DOT[accent] : "bg-foreground")} />
          <span className="font-headline text-[1.6rem] leading-none">
            {take.publishedAt ? editRuleDate(take.publishedAt) : ""}
          </span>
          <span className="flex-1" />
          <span aria-label={take.rating === null ? "Not scored" : `Scored ${take.rating}`} className={cn(box, "size-[42px] text-[1.7rem]")}>
            {take.rating ?? "—"}
          </span>
        </div>
        <p className={cn(LABEL, "mt-3.5 mb-0 text-[0.74rem]", take.current ? NOW_LABEL[accent] : "text-faint-foreground")}>
          {label} · {change}
        </p>
        {controls && <div className="mt-2 -ml-2 flex flex-wrap gap-1">{controls}</div>}
      </div>
    </>
  );
}
