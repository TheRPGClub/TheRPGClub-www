import type { PatchCounts } from "@/lib/patch-notes/types";

const ROWS: { key: keyof PatchCounts; label: string }[] = [
  { key: "new", label: "New" },
  { key: "improved", label: "Improved" },
  { key: "fixed", label: "Fixed" },
];

// A Patch page's left bar (www#236, from The Insert): the Published date,
// then how many changes are New, Improved and Fixed, each a label beside its
// Anton figure under a 2px paper rule. On phones it sits above the text as
// one row.
export function PatchLedger({ date, dateTime, counts }: { date: string; dateTime: string | null; counts: PatchCounts }) {
  return (
    <aside aria-label="About this Patch" className="flex flex-wrap items-end gap-x-8 gap-y-4 md:block">
      {date && (
        <div>
          <p className="font-label text-xs leading-none font-bold tracking-[0.08em] text-faint-foreground">Published</p>
          <p className="font-label mt-2 text-[0.9375rem] leading-none font-extrabold tracking-[0.08em]">
            <time dateTime={dateTime ?? undefined}>{date}</time>
          </p>
        </div>
      )}
      <dl className="flex flex-wrap gap-x-6 gap-y-3 border-foreground md:mt-6 md:grid md:gap-3 md:border-t-2 md:pt-3">
        {ROWS.map((row) => (
          <div key={row.key} className="flex items-baseline gap-2.5 md:justify-between">
            <dt className="font-label text-[0.8125rem] leading-none font-bold tracking-[0.08em] text-dim-foreground">
              {row.label}
            </dt>
            <dd className="font-headline text-2xl leading-none">{counts[row.key]}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
