"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { EyeOff, ListFilter } from "lucide-react";
import { calendarHref, type CalendarFilters, type PlatformOption } from "@/lib/release-calendar";
import type { HiddenPlatform } from "@/lib/hidden-platforms";
import { useHiddenPlatforms } from "@/hooks/use-hidden-platforms";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { HiddenPlatformsSection } from "./hidden-platforms-section";

// The platform filter (www#114, api#427 option A). "Filter this visit": pick
// any number of platforms, each pick changing the address at once (no Apply
// step), keeping the grid's month. Each one can also be hidden for good, a
// Hidden Platform saved for the member; those wait in their own section
// with Unhide. `hidden` null: the list couldn't be read (or the member can't
// keep one), so the filter only filters.
export function PlatformFilter({
  filters,
  today,
  options,
  hidden,
}: {
  filters: CalendarFilters;
  today: string;
  options: PlatformOption[];
  hidden: HiddenPlatform[] | null;
}) {
  const router = useRouter();
  const [navigating, startTransition] = useTransition();
  const [value, setValue] = useState(filters.platforms);
  // A link elsewhere on the page ("Show all platforms") changed the filter.
  const key = filters.platforms.join(",");
  const [seen, setSeen] = useState(key);
  if (seen !== key) {
    setSeen(key);
    setValue(filters.platforms);
  }
  const saves = useHiddenPlatforms(hidden?.map((p) => p.platform_id) ?? []);
  const names = new Map<number, string>([
    ...options.map((o): [number, string] => [o.id, o.name]),
    ...(hidden ?? []).map((p): [number, string] => [p.platform_id, p.platform_name]),
  ]);
  const visit = options.filter((o) => !saves.ids.includes(o.id));
  const picked = value.filter((id) => !saves.ids.includes(id));

  const go = (platforms: number[]) => {
    setValue(platforms);
    startTransition(() =>
      router.push(calendarHref(filters, { platforms }, today), {
        scroll: false,
      }),
    );
  };
  const toggle = (id: number, on: boolean) => go(on ? [...value, id] : value.filter((x) => x !== id));
  // A platform hidden while it is picked leaves the filter too.
  const hideForGood = (id: number) =>
    saves.hide(id, () => value.includes(id) && go(value.filter((x) => x !== id)));

  return (
    <Popover>
      <PopoverTrigger
        variant="field"
        aria-label="Platforms"
        aria-busy={navigating || saves.pending}
        className={cn(
          "h-9 min-w-0 flex-1 gap-2 px-3 sm:min-w-[230px] sm:flex-none",
          navigating && "opacity-70",
        )}
      >
        <ListFilter aria-hidden />
        <span className="flex min-w-0 items-center gap-2 overflow-hidden">
          <span>Platforms:</span>
          {picked.length === 0 ? (
            <span>All</span>
          ) : (
            <>
              <Badge tone="inverse" size="sm" className="min-w-0 truncate">
                {names.get(picked[0]) ?? "Unknown platform"}
              </Badge>
              {picked.length > 1 && <span>+{picked.length - 1}</span>}
            </>
          )}
          {hidden && saves.ids.length > 0 && !filters.showHidden && (
            <span className="text-faint-foreground">· {saves.ids.length} hidden</span>
          )}
        </span>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(22rem,calc(100vw-2rem))] gap-0 p-0">
        <div className="p-3 pb-2">
          <PopoverTitle className="mb-1.5 px-1">Filter this visit</PopoverTitle>
          {visit.length === 0 && (
            <p className="px-1 py-1.5 text-sm text-dim-foreground">No other platforms on the calendar.</p>
          )}
          <ul aria-label="Platforms to show">
            {visit.map((o) => (
              <li key={o.id} className="group/row flex items-center gap-2 rounded-xs pr-1 hover:bg-muted">
                <Label
                  variant="option"
                  className="flex min-h-9 min-w-0 flex-1 cursor-pointer items-center gap-2.5 px-1"
                >
                  <Checkbox checked={value.includes(o.id)} onCheckedChange={(on) => toggle(o.id, on)} />
                  <span className="truncate">{o.name}</span>
                </Label>
                {hidden && (
                  <span className="transition-opacity pointer-fine:opacity-0 pointer-fine:group-has-focus-visible/row:opacity-100 pointer-fine:group-hover/row:opacity-100">
                    <Button
                      variant="outline"
                      size="xs"
                      disabled={saves.pending}
                      aria-label={`Hide ${o.name} for good`}
                      onClick={() => hideForGood(o.id)}
                    >
                      <EyeOff data-icon="inline-start" aria-hidden />
                      Hide for good
                    </Button>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
        {hidden && <HiddenPlatformsSection ids={saves.ids} names={names} saves={saves} />}
      </PopoverContent>
    </Popover>
  );
}
