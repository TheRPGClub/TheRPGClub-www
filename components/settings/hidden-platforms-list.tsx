"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { hideableChoices, type HiddenPlatforms, type PlatformChoice } from "@/lib/hidden-platforms";
import { useHiddenPlatforms } from "@/hooks/use-hidden-platforms";
import { Button } from "@/components/ui/button";
import { HiddenPlatformPicker } from "@/components/settings/hidden-platform-picker";
import { SectionHeading } from "@/components/templates/page-header";
import { cn } from "@/lib/utils";

// The data for the Release Calendar row's Hidden Platforms (api#427): null
// when the member can't use the Release Calendar, so the list is left out.
export interface HiddenPlatformsData {
  // Null when the read failed.
  hidden: HiddenPlatforms | null;
  // What can be hidden: every platform some game is on.
  choices: PlatformChoice[];
}

// The member's Hidden Platforms, the Release Calendar's own settings on the
// Features tab beside the News Hub's News Categories: one line on what they
// do, each with Unhide, then a platform picker and Hide. The same list
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
    <section aria-labelledby={`${id}-title`}>
      <SectionHeading
        title={<span id={`${id}-title`}>Hidden Platforms</span>}
        count={hidden && !unavailable ? `${saves.ids.length} hidden` : undefined}
      />
      <p id={`${id}-intro`} className="mt-3 max-w-[60ch] text-sm text-dim-foreground">
        Never on your Release Calendar or your Upcoming Releases panel. &ldquo;Show all&rdquo; on the
        calendar brings them back for one visit.
      </p>
      {!hidden ? (
        <p role="alert" className="mt-2 text-sm text-dim-foreground">
          Couldn&apos;t load your Hidden Platforms. Reload the page to try again.
        </p>
      ) : (
        <>
          <ul aria-label="Hidden Platforms" aria-describedby={`${id}-intro`} className="mt-3 border-t border-border">
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
          <HiddenPlatformPicker
            offered={offered}
            pick={pick}
            onPick={setPick}
            disabled={off}
            onHide={() => pick && saves.hide(Number(pick), () => setPick(null))}
          />
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
    </section>
  );
}
