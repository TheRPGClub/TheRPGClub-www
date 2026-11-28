import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { calendarHref, type CalendarFilters } from "@/lib/release-calendar";
import { hiddenCount, platformNames } from "@/lib/hidden-platforms";

const LINK =
  "rounded-xs underline decoration-gotm decoration-2 underline-offset-4 transition-colors outline-none hover:text-highlight focus-visible:ring-3 focus-visible:ring-highlight/50";

// The ruled note under the toolbar while the member has Hidden Platforms
// (api#427): how many and which are left out, with "Show all" for the visit
// (`show_hidden=1`, kept while moving between months) and the way to Settings.
// While Show all is on it says so, with the way back.
export function HiddenPlatformsNote({
  filters,
  today,
  names,
}: {
  filters: CalendarFilters;
  today: string;
  // The Hidden Platforms' names, in name order.
  names: string[];
}) {
  if (names.length === 0) return null;
  const list = platformNames(names);

  return (
    <div data-slot="hidden-platforms-note" className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-border py-2.5 text-[0.9375rem] text-dim-foreground">
      {filters.showHidden ? (
        <>
          <p className="flex items-center gap-2">
            <Eye aria-hidden className="size-4 shrink-0" />
            <span>
              Showing <strong className="font-bold text-foreground">all platforms</strong> for this visit.
            </span>
          </p>
          <Link
            href={calendarHref(filters, { showHidden: false }, today)}
            scroll={false}
            className={`${LINK} text-foreground`}
          >
            Hide {list} again
          </Link>
        </>
      ) : (
        <>
          <p className="flex min-w-0 items-center gap-2">
            <EyeOff aria-hidden className="size-4 shrink-0" />
            <span>
              <strong className="font-bold text-foreground">{hiddenCount(names.length)}:</strong> {list}.
            </span>
          </p>
          <Link
            href={calendarHref(filters, { showHidden: true }, today)}
            scroll={false}
            className={`${LINK} text-foreground`}
          >
            Show all
          </Link>
          <Link
            href="/settings"
            className={`${LINK} font-label text-[0.75rem] font-bold tracking-[0.08em] uppercase decoration-transparent hover:decoration-gotm`}
          >
            Manage in Settings
          </Link>
        </>
      )}
    </div>
  );
}
