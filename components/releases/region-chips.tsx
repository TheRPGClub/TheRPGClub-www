import type { UpcomingRelease } from "@/lib/api/types";
import { regionTone } from "@/lib/releases";
import { regionGroups } from "@/lib/release-calendar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// An Upcoming Release's platforms by region: each region chip in its ink
// (www#115's tones), then the platforms released there. `compact` is the
// grid and band form, the platforms as one line of small type; the list
// gives each platform its own chip. A past one's chips drop to outlines.
export function RegionChips({
  upcoming,
  past = false,
  compact = false,
}: {
  upcoming: UpcomingRelease;
  past?: boolean;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex flex-wrap", compact ? "gap-[3px_8px]" : "gap-[6px_12px]")}>
      {regionGroups(upcoming).map((group) => (
        <span
          key={group.code}
          className={cn(
            "inline-flex",
            compact ? "max-w-full items-start gap-[3px]" : "flex-wrap items-center gap-1",
          )}
        >
          <Badge
            tone={regionTone(group.code)}
            size={compact ? "sm" : "default"}
            past={past}
            title={group.name}
            className={compact ? "min-w-6" : "min-w-[30px]"}
          >
            {group.code}
          </Badge>
          {compact ? (
            <span
              className={cn(
                "font-label min-w-0 pt-[3px] text-[0.72rem] leading-[1.2] font-bold tracking-[0.05em]",
                past ? "text-faint-foreground" : "text-dim-foreground",
              )}
            >
              {group.platforms.join(" · ")}
            </span>
          ) : (
            group.platforms.map((platform) => <Badge key={platform}>{platform}</Badge>)
          )}
        </span>
      ))}
    </div>
  );
}
