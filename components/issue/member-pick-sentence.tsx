import type { ReactNode } from "react";
import { ChevronDown, Dices } from "lucide-react";
import type { BacklogPickMeta } from "@/lib/api/types";
import { PICK_SOURCES, type BacklogPickParams } from "@/lib/api/backlog-pick";
import { Button } from "@/components/ui/button";

// The picker's filters read as one sentence the member completes: "I've got
// [time] on [platform]. Deal from my [list]." Each blank is a real select.
// A plain GET form: submitting deals a fresh hand under the new filters, so
// it drops the seed and position and the server draws a new seed.

const HOUR_STOPS = [5, 10, 15, 20, 30, 40, 60, 80, 100];

function Blank({
  name,
  label,
  defaultValue,
  children,
}: {
  name: string;
  label: string;
  defaultValue: string;
  children: ReactNode;
}) {
  return (
    <span className="relative inline-flex items-center align-baseline">
      <select
        name={name}
        aria-label={label}
        defaultValue={defaultValue}
        className="font-headline max-w-full cursor-pointer appearance-none border-b-4 border-highlight bg-transparent pr-[0.8em] pl-1 leading-[1] text-highlight [color-scheme:dark] [field-sizing:content] transition-colors outline-none hover:border-paper hover:text-paper focus-visible:border-paper focus-visible:text-paper [&>option]:bg-ink-2 [&>option]:font-sans [&>option]:text-base [&>option]:text-paper [&>option]:normal-case"
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        strokeWidth={3}
        className="pointer-events-none absolute right-0 size-[0.5em] text-highlight"
      />
    </span>
  );
}

export function PickSentence({
  filters,
  meta,
}: {
  filters: BacklogPickParams;
  meta: BacklogPickMeta | null;
}) {
  const platformOptions = meta?.platforms ?? [];
  const selectedMissing =
    filters.platformId !== null &&
    !platformOptions.some((p) => p.platform_id === filters.platformId);
  const hourStops =
    filters.maxHours !== null && !HOUR_STOPS.includes(filters.maxHours)
      ? [...HOUR_STOPS, filters.maxHours].sort((a, b) => a - b)
      : HOUR_STOPS;
  const sourceNoun =
    filters.source === "backlog"
      ? "backlogged"
      : filters.source === "collection"
        ? "collected"
        : "backlogged and collected";

  return (
    <form method="get" className="border-b-2 border-paper pb-6.5">
      <p className="font-headline max-w-[22ch] text-[2.4rem] leading-[1.15] text-balance sm:text-5xl lg:text-[4rem]">
        I&apos;ve got{" "}
        <Blank
          name="max_hours"
          label="Time to play"
          defaultValue={filters.maxHours?.toString() ?? ""}
        >
          <option value="">all the time</option>
          {hourStops.map((h) => (
            <option key={h} value={h}>
              up to {h} hour{h === 1 ? "" : "s"}
            </option>
          ))}
        </Blank>{" "}
        on{" "}
        <span className="whitespace-nowrap">
        <Blank
          name="platform_id"
          label="Platform"
          defaultValue={filters.platformId?.toString() ?? ""}
        >
          <option value="">any platform</option>
          {selectedMissing && (
            <option value={filters.platformId!}>
              platform #{filters.platformId}
            </option>
          )}
          {platformOptions.map((p) => (
            <option key={p.platform_id} value={p.platform_id}>
              {p.platform_name ??
                p.platform_abbreviation ??
                `Platform #${p.platform_id}`}{" "}
              ({p.count})
            </option>
          ))}
        </Blank>
        .</span> Deal from my{" "}
        <span className="whitespace-nowrap">
        <Blank name="source" label="Pick from" defaultValue={filters.source}>
          {PICK_SOURCES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label.toLowerCase()}
            </option>
          ))}
        </Blank>
        .</span>
      </p>
      <div className="mt-5.5 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Button type="submit" variant="highlight">
          <Dices data-icon="inline-start" />
          Deal three
        </Button>
        {meta && (
          <p className="font-label text-sm font-extrabold tracking-[0.08em] text-paper-mute">
            From {meta.total} {sourceNoun} game{meta.total === 1 ? "" : "s"}
          </p>
        )}
      </div>
    </form>
  );
}
