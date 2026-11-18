import type { DatePrecision, Release } from "@/lib/api/types";
import {
  countdown,
  isPastRelease,
  precisionNote,
  regionTone,
  releaseDateLabel,
} from "@/lib/games/releases";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// A machine-readable date where HTML has one: a day, a month ("2026-12") or a
// year. A quarter has none.
function machineDate(date: string, precision: DatePrecision): string | undefined {
  if (precision === "day") return date.slice(0, 10);
  if (precision === "month") return date.slice(0, 7);
  if (precision === "year") return date.slice(0, 4);
  return undefined;
}

// One region and date pair in a platform's row: the region chip in its ink,
// the date at its Date Precision, then the dashed chip saying what is still
// unknown ("Day TBA", "Month TBA", "No date yet") or, for a day this week,
// the countdown. A past one goes faint, its region chip an outline.
export function ReleaseLine({ release, today }: { release: Release; today: string }) {
  const { release_date: date, date_precision: precision } = release;
  const label = releaseDateLabel(date, precision);
  const note = precisionNote(precision);
  const soon = countdown(release, today);
  const past = isPastRelease(release, today);

  return (
    <li
      className={cn(
        "flex items-center gap-2 text-sm",
        past ? "text-faint-foreground" : "text-foreground",
      )}
    >
      <Badge
        tone={regionTone(release.region_code)}
        past={past}
        className="min-w-[30px]"
        title={release.region_name}
      >
        {release.region_code}
      </Badge>
      {label && date && (
        <time dateTime={machineDate(date, precision)} className="font-semibold">
          {label}
        </time>
      )}
      {note && <Badge tone="precision">{note}</Badge>}
      {soon && (
        <span className="font-label ml-auto text-[0.72rem] font-extrabold tracking-[0.08em] whitespace-nowrap text-foreground">
          {soon}
        </span>
      )}
    </li>
  );
}
