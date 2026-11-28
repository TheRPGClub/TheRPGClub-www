import type { DecadeRow } from "@/lib/challenges/slots";
import { YearTileView } from "@/components/challenges/slots/year-tiles";

// A Slots Run year by year (surface brief challenges-slots, 3A): a decade
// label column ("80s" in Anton) and ten columns, ·0 to ·9. Every Run of the
// Challenge, yours or another member's, is drawn the same way.
export function RunMatrix({ rows, label }: { rows: DecadeRow[]; label: string }) {
  return (
    <div
      role="group"
      data-slot="run-matrix"
      aria-label={label}
      className="grid grid-cols-[26px_repeat(10,minmax(0,1fr))] gap-[3px] min-[480px]:gap-1.5 sm:grid-cols-[70px_repeat(10,minmax(0,1fr))] sm:gap-2"
    >
      <span aria-hidden />
      {Array.from({ length: 10 }, (_, digit) => (
        <span
          key={digit}
          aria-hidden
          className="font-label text-center text-[0.7rem] tracking-[0.08em] text-faint-foreground sm:text-[0.75rem]"
        >
          ·{digit}
        </span>
      ))}
      {rows.map((row) => (
        <div key={row.decade} className="contents">
          <span className="font-headline self-center text-[0.95rem] normal-case leading-none text-faint-foreground sm:text-[1.625rem]">
            {row.label}
          </span>
          {row.tiles.map((tile, digit) => (
            <YearTileView key={digit} tile={tile} />
          ))}
        </div>
      ))}
    </div>
  );
}
