import type { BacklogPick } from "@/lib/api/types";

// A dealt card's HowLongToBeat times side by side, or a line saying there
// are none.

// HowLongToBeat's display strings ("12½ Hours", "30 Mins") as a short
// numeral and unit; anything else is shown as written.
function hltbShort(value: string): { n: string; unit: string } {
  const text = value.replace("½", ".5").trim();
  const match = text.match(/(\d+(?:\.\d+)?)\s*(hours?|mins?)/i);
  if (!match) return { n: value, unit: "" };
  return { n: match[1], unit: /min/i.test(match[2]) ? "m" : "h" };
}

function timesOf(pick: BacklogPick) {
  return [
    { label: "Main", value: pick.hltb?.main },
    { label: "+ Sides", value: pick.hltb?.main_sides },
    { label: "Complete", value: pick.hltb?.completionist },
  ].filter((t): t is { label: string; value: string } => Boolean(t.value));
}

export function DealTimes({ pick }: { pick: BacklogPick }) {
  const times = timesOf(pick);
  if (times.length === 0) {
    return (
      <p className="font-label border-t border-border pt-2.5 text-[0.8rem] font-bold tracking-[0.06em] text-faint-foreground">
        No HowLongToBeat times
      </p>
    );
  }
  return (
    <dl className="grid grid-cols-3 border-t border-border pt-2.5">
      {times.map((t) => {
        const { n, unit } = hltbShort(t.value);
        return (
          <div key={t.label} className="flex flex-col-reverse gap-1">
            <dt className="font-label text-[0.68rem] font-extrabold tracking-[0.08em] text-faint-foreground">
              {t.label}
            </dt>
            <dd className="font-headline text-[1.6rem] leading-[0.85] sm:text-[1.9rem]">
              {n}
              {unit && (
                <small className="font-label ml-px text-sm font-extrabold">
                  {unit}
                </small>
              )}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
