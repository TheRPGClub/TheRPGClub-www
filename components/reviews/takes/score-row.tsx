import type { ScoreRowStop } from "@/lib/reviews/takes";
import { cn } from "@/lib/utils";

// Under the banner's score: every score the Review has had, oldest first,
// with the change between them on the line (72 +13 85 −5 80). Older scores
// are outlined; the current one is filled.
export function ScoreRow({ stops }: { stops: ScoreRowStop[] }) {
  if (stops.length === 0) return null;
  const label = stops
    .map((s, i) => (i === 0 ? `${s.rating}` : `${s.change} to ${s.rating}`))
    .join(", ");
  return (
    <ol aria-label={`Score history: ${label}`} className="m-0 flex list-none items-start p-0 md:mt-3.5">
      {stops.map((s, i) => (
        <li key={i} className="flex items-start">
          {s.change && (
            <span aria-hidden className="relative mt-[15px] h-0.5 w-6 bg-border-strong md:mt-[19px] md:w-11">
              <i className="font-label absolute -top-[15px] left-1/2 -translate-x-1/2 text-[0.72rem] font-extrabold tracking-[0.04em] whitespace-nowrap text-dim-foreground not-italic md:-top-[17px]">
                {s.change}
              </i>
            </span>
          )}
          <span aria-hidden className="flex flex-col items-center gap-1.25">
            <span
              className={cn(
                "font-headline grid size-8 place-items-center rounded-[2px] text-[1.2rem] leading-none md:size-10 md:text-[1.5rem]",
                s.current
                  ? "bg-foreground text-background"
                  : "text-dim-foreground shadow-[inset_0_0_0_1.5px_color-mix(in_oklab,var(--color-foreground)_55%,transparent)]",
              )}
            >
              {s.rating}
            </span>
            <small className="font-label text-[0.66rem] font-extrabold tracking-[0.08em] text-faint-foreground uppercase">
              {s.label}
            </small>
          </span>
        </li>
      ))}
    </ol>
  );
}
