import { Dices } from "lucide-react";
import type { BacklogPickMeta } from "@/lib/api/types";
import type { BacklogPickParams } from "@/lib/api/backlog-pick";
import {
  hourItems,
  platformItems,
  sourceItems,
  type BlankItem,
} from "@/lib/backlog-pick-blanks";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// The picker's filters read as one sentence the member completes: "I've got
// [time] on [platform]. Deal from my [list]." Each blank is a Select.
// A plain GET form: submitting deals a fresh hand under the new filters, so
// it drops the seed and position and the server draws a new seed.

// One blank: a select drawn as a headline word on the yellow rule.
function Blank({
  name,
  label,
  defaultValue,
  items,
}: {
  name: string;
  label: string;
  defaultValue: string;
  items: BlankItem[];
}) {
  return (
    <span className="relative inline-flex items-center align-baseline">
      <Select name={name} defaultValue={defaultValue} items={items}>
        <SelectTrigger
          variant="blank"
          aria-label={label}
          className="max-w-full gap-[0.3em] py-0 pr-0 pl-1 data-[size=default]:h-auto"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
  const sourceNoun =
    filters.source === "backlog"
      ? "backlogged"
      : filters.source === "collection"
        ? "collected"
        : "backlogged and collected";

  return (
    <form method="get" className="border-b-2 border-foreground pb-6.5">
      <p className="font-headline max-w-[22ch] text-[2.4rem] leading-[1.15] text-balance sm:text-5xl lg:text-[4rem]">
        I&apos;ve got{" "}
        <Blank
          name="max_hours"
          label="Time to play"
          defaultValue={filters.maxHours?.toString() ?? ""}
          items={hourItems(filters.maxHours)}
        />{" "}
        on{" "}
        <span className="whitespace-nowrap">
        <Blank
          name="platform_id"
          label="Platform"
          defaultValue={filters.platformId?.toString() ?? ""}
          items={platformItems(filters.platformId, meta?.platforms ?? [])}
        />
        .</span> Deal from my{" "}
        <span className="whitespace-nowrap">
        <Blank
          name="source"
          label="Pick from"
          defaultValue={filters.source}
          items={sourceItems()}
        />
        .</span>
      </p>
      <div className="mt-5.5 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Button type="submit" variant="highlight">
          <Dices data-icon="inline-start" />
          Deal three
        </Button>
        {meta && (
          <p className="font-label text-sm font-extrabold tracking-[0.08em] text-faint-foreground">
            From {meta.total} {sourceNoun} game{meta.total === 1 ? "" : "s"}
          </p>
        )}
      </div>
    </form>
  );
}
