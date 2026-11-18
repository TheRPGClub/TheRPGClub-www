"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ListFilter } from "lucide-react";
import { calendarHref, type CalendarFilters, type PlatformOption } from "@/lib/release-calendar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

// The platform filter: pick any number of platforms; the grid and the list
// keep the Upcoming Releases with a Release on one of them. Each pick
// changes the address at once (no Apply step), keeping the grid's month.
export function PlatformFilter({
  filters,
  today,
  options,
}: {
  filters: CalendarFilters;
  today: string;
  options: PlatformOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [value, setValue] = useState(filters.platforms.map(String));
  // A link elsewhere on the page ("Show all platforms") changed the filter.
  const key = filters.platforms.join(",");
  const [seen, setSeen] = useState(key);
  if (seen !== key) {
    setSeen(key);
    setValue(filters.platforms.map(String));
  }
  const items = Object.fromEntries(options.map((o) => [String(o.id), o.name]));

  const change = (next: string[]) => {
    setValue(next);
    const platforms = next.map(Number);
    startTransition(() => router.push(calendarHref(filters, { platforms }, today), { scroll: false }));
  };

  return (
    <Select multiple items={items} value={value} onValueChange={change}>
      <SelectTrigger
        aria-label="Platforms"
        aria-busy={pending}
        className={cn("h-9 min-w-0 flex-1 gap-2 px-3 sm:min-w-[230px] sm:flex-none", pending && "opacity-70")}
      >
        <ListFilter aria-hidden />
        <SelectValue className="min-w-0 gap-2 overflow-hidden">
          {(picked: string[]) => (
            <>
              <span>Platforms:</span>
              {picked.length === 0 ? (
                <span>All</span>
              ) : (
                <>
                  <Badge tone="inverse" size="sm" className="min-w-0 truncate">
                    {items[picked[0]] ?? "Unknown platform"}
                  </Badge>
                  {picked.length > 1 && <span>+{picked.length - 1}</span>}
                </>
              )}
            </>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="end" alignItemWithTrigger={false} className="min-w-56">
        {options.map((o) => (
          <SelectItem key={o.id} value={String(o.id)}>
            {o.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
