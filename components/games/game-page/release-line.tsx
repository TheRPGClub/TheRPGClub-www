import type { Release } from "@/lib/api/types";
import { countdown } from "@/lib/games/releases";
import { isPast, machineDate, precisionNote, regionTone, releaseDateLabel } from "@/lib/releases";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// One region and date pair in a platform's row: the region chip in its ink,
// the date at its Date Precision, then the dashed chip saying what is still
// unknown ("Day TBA", "Month TBA", "No date yet") or, for a day this week,
// the countdown. A past one goes faint, its region chip an outline.
export function ReleaseLine({ release, today }: { release: Release; today: string }) {
  const { release_date: date, date_precision: precision } = release;
  const label = releaseDateLabel(date, precision);
  const note = precisionNote(precision);
  const soon = countdown(release, today);
  const past = isPast(date, precision, today);

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
