import type { DatePrecision } from "@/lib/api/types";
import { precisionNote } from "@/lib/releases";
import { weekdayOf } from "@/lib/release-calendar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// The big date beside a group in the list: the day and its weekday, or what
// is known of a vague date ("Dec", "Q3", "2027", "TBA") over the dashed chip
// saying what is still unknown.
function bigDate(date: string | null, precision: DatePrecision): string {
  if (!date || precision === "tba") return "TBA";
  const [y, m, d] = date.split("-").map(Number);
  if (precision === "day") return String(d);
  if (precision === "month") return MONTHS[m - 1];
  if (precision === "quarter") return `Q${Math.floor((m - 1) / 3) + 1}`;
  return String(y);
}

export function DateColumn({
  date,
  precision,
  past,
}: {
  date: string | null;
  precision: DatePrecision;
  past: boolean;
}) {
  const note = precisionNote(precision);
  return (
    <div className="flex flex-col items-start gap-1.5">
      <b
        className={cn(
          "font-headline leading-[0.85] font-normal",
          precision === "day" ? "text-4xl sm:text-[2.75rem]" : "text-2xl sm:text-3xl",
          past || precision === "tba" ? "text-faint-foreground" : "text-foreground",
        )}
      >
        {bigDate(date, precision)}
      </b>
      {note ? (
        <Badge tone="precision" className="max-sm:h-5 max-sm:px-1.5">
          {note}
        </Badge>
      ) : (
        date && (
          <span
            className={cn(
              "font-label text-[0.8125rem] font-bold tracking-[0.08em]",
              past ? "text-faint-foreground" : "text-dim-foreground",
            )}
          >
            {weekdayOf(date)}
          </span>
        )
      )}
    </div>
  );
}
