"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { hideableChoices, type HiddenPlatforms, type PlatformChoice } from "@/lib/hidden-platforms";
import { useHiddenPlatforms } from "@/hooks/use-hidden-platforms";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

// The data for the Release Calendar row's Hidden Platforms (api#427): null
// when the member can't use the Release Calendar, so the list is left out.
export interface HiddenPlatformsData {
  // Null when the read failed.
  hidden: HiddenPlatforms | null;
  // What can be hidden: every platform some game is on.
  choices: PlatformChoice[];
}

// The member's Hidden Platforms, nested under the Release Calendar's
// Feature row as News Categories are under the News Hub's: one line on what
// they do, each with Unhide, then a platform picker and Hide. The same list
// /releases changes. Dimmed and inert while the Release Calendar itself is
// hidden, with the reason in one line.
export function HiddenPlatformsList({
  data,
  unavailable,
}: {
  data: HiddenPlatformsData;
  unavailable: boolean;
}) {
  const id = useId();
  const { hidden, choices } = data;
  const saves = useHiddenPlatforms(hidden?.platform_ids ?? []);
  const [pick, setPick] = useState<string | null>(null);
  const names = new Map<number, string>([
    ...choices.map((c): [number, string] => [c.id, c.name]),
    ...(hidden?.platforms ?? []).map((p): [number, string] => [p.platform_id, p.platform_name]),
  ]);
  const rows = saves.ids
    .map((pid) => ({ id: pid, name: names.get(pid) ?? "Unknown platform" }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const offered = hideableChoices(choices, saves.ids);
  const off = unavailable || saves.pending;

  return (
    <div className="mt-3 ml-1 border-l border-faint-foreground pl-4 sm:ml-2 sm:pl-5">
      <p id={`${id}-intro`} className="max-w-[60ch] text-sm text-dim-foreground">
        Hidden Platforms: never on your Release Calendar or your Upcoming Releases panel. &ldquo;Show
        all&rdquo; on the calendar brings them back for one visit.
      </p>
      {!hidden ? (
        <p role="alert" className="mt-2 text-sm text-dim-foreground">
          Couldn&apos;t load your Hidden Platforms. Reload the page to try again.
        </p>
      ) : (
        <>
          <ul aria-label="Hidden Platforms" aria-describedby={`${id}-intro`} className="mt-1.5">
            {rows.length === 0 && (
              <li className="border-b border-border py-2.5 text-sm text-faint-foreground">
                None hidden. Every platform shows on your calendar.
              </li>
            )}
            {rows.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-5 border-b border-border py-2">
                <span className={cn("flex min-w-0 items-center gap-2.5", unavailable && "opacity-45")}>
                  <EyeOff aria-hidden className="size-4 shrink-0 text-faint-foreground" />
                  <span className="font-label min-w-0 truncate text-[0.95rem] font-bold">{p.name}</span>
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={off}
                  aria-label={`Unhide ${p.name}`}
                  onClick={() => saves.unhide(p.id)}
                >
                  <Eye data-icon="inline-start" aria-hidden />
                  Unhide
                </Button>
              </li>
            ))}
          </ul>
          <div className="mt-2.5 flex items-center gap-2">
            {/* Wrapped: the Select's hidden input is a sibling of its trigger. */}
            <div className="min-w-0 flex-1">
              <Select
                items={Object.fromEntries(offered.map((c) => [String(c.id), c.name]))}
                value={pick}
                onValueChange={(v) => setPick(v as string | null)}
                disabled={off || offered.length === 0}
              >
                <SelectTrigger
                  aria-label="Platform to hide"
                  className="w-full min-w-0 data-[size=default]:h-9"
                >
                  <SelectValue placeholder="Choose a platform" />
                </SelectTrigger>
                <SelectContent>
                  {offered.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              disabled={off || pick === null}
              onClick={() => pick && saves.hide(Number(pick), () => setPick(null))}
            >
              <EyeOff data-icon="inline-start" aria-hidden />
              Hide
            </Button>
          </div>
          {saves.error && (
            <p role="alert" className="mt-2 text-sm text-destructive">
              {saves.error}
            </p>
          )}
          {unavailable && (
            <p className="mt-2 text-sm text-dim-foreground">
              Show the Release Calendar to choose its Hidden Platforms.
            </p>
          )}
        </>
      )}
    </div>
  );
}
