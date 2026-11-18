import Link from "next/link";
import { Cake } from "lucide-react";
import type { BirthdayLineEntry } from "@/lib/dashboard/birthdays";
import { Badge } from "@/components/ui/badge";

// Upcoming Birthdays as one ruled contents line (lib/dashboard/birthdays):
// a label-type head, then each member in date order, today's in Anton
// behind a paper "Today" chip. The caller leaves it out when it is hidden.
export function UpcomingBirthdays({ entries }: { entries: BirthdayLineEntry[] }) {
  return (
    <section
      aria-labelledby="upcoming-birthdays"
      className="flex flex-col gap-2.5 border-t-2 border-b border-t-foreground border-b-border py-3.5 sm:flex-row sm:items-baseline sm:gap-[18px]"
    >
      <h2
        id="upcoming-birthdays"
        className="font-label flex shrink-0 items-center gap-2 text-[0.95rem] leading-none font-extrabold tracking-[0.08em] whitespace-nowrap"
      >
        <Cake aria-hidden className="size-4" />
        <span>
          <span className="sr-only">Upcoming </span>Birthdays
        </span>
      </h2>
      <ol className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
        {entries.map((entry, i) => (
          <li key={entry.userId} className="inline-flex items-baseline gap-3">
            <Entry entry={entry} />
            {i < entries.length - 1 && (
              <span aria-hidden className="font-label text-[0.95rem] leading-none font-bold text-border-strong">
                /
              </span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

function Entry({ entry }: { entry: BirthdayLineEntry }) {
  const href = `/members/${entry.userId}`;
  if (entry.today) {
    return (
      <span className="inline-flex items-baseline gap-[7px] whitespace-nowrap">
        <Badge tone="inverse" size="sm" className="self-center">
          Today
        </Badge>
        <Link
          href={href}
          className="font-headline text-[1.375rem] leading-none transition-colors hover:text-highlight"
        >
          {entry.name}
        </Link>
      </span>
    );
  }
  return (
    <span className="inline-flex items-baseline gap-[7px] whitespace-nowrap">
      <span className="font-label text-[0.78rem] font-bold tracking-[0.08em] text-faint-foreground">
        {entry.when}
      </span>
      <Link
        href={href}
        className="font-semibold underline decoration-border-strong underline-offset-4 transition-colors hover:text-highlight hover:decoration-highlight"
      >
        {entry.name}
      </Link>
    </span>
  );
}
