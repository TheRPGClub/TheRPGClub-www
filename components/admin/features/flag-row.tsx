import { useId } from "react";
import type { FeatureFlagEntry } from "@/lib/feature-flags";
import { useFlagRow } from "@/hooks/use-flag-row";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { COVERAGE, CoverageChips, LastChange } from "./flag-cells";
import { OffConfirm, ReasonEditor } from "./flag-reason";
import { FlagStateControl } from "./flag-state-control";

export interface RowProps {
  clock: Date;
  landed: string | null;
  onSaved: (entry: FeatureFlagEntry, changed: boolean) => void;
}

// One Feature: its name, coverage, last change and state control, with the
// reason note or the Off confirm in a row of its own under it. Below 85rem
// (1360px) the row stacks into a block.
export function FlagRow({ entry, clock, landed, onSaved }: RowProps & { entry: FeatureFlagEntry }) {
  const id = useId();
  const row = useFlagRow(entry, onSaved);
  const { panel, draft, error, busy } = row;
  const panelId = `${id}-panel`;
  const field = { reasonId: `${id}-reason`, draft, onDraft: row.setDraft, name: entry.name };

  return (
    <>
      <TableRow
        className={cn(
          "align-middle max-[85rem]:grid max-[85rem]:grid-cols-[minmax(0,1fr)_auto] max-[85rem]:items-center max-[85rem]:gap-x-3 max-[85rem]:gap-y-2 max-[85rem]:py-3.5",
          panel || error ? "border-b-0 max-[85rem]:pb-2" : "border-b",
        )}
      >
        <TableHead scope="row" className="h-auto py-2.5 pr-3 pl-0 align-middle whitespace-normal max-[85rem]:p-0">
          <span
            className={cn(
              "font-headline flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[1.4rem] leading-[1.05]",
              entry.state === "off" && "text-faint-foreground",
            )}
          >
            {entry.name}
            {entry.state === "preview" && (
              <span className="font-label inline-flex h-[22px] items-center rounded-xs px-[7px] text-[0.72rem] font-extrabold tracking-[0.08em] text-highlight shadow-[inset_0_0_0_1.5px_var(--color-highlight)]">
                Staff only
              </span>
            )}
          </span>
        </TableHead>
        {COVERAGE.map((c) => (
          <TableCell
            key={c.key}
            variant="grouped"
            className="py-2.5 pr-3 pl-0 whitespace-normal max-[85rem]:col-span-2 max-[85rem]:grid max-[85rem]:grid-cols-[4.5rem_minmax(0,1fr)] max-[85rem]:items-baseline max-[85rem]:p-0 min-[85rem]:border-l min-[85rem]:pl-3"
          >
            <span className="font-label text-[0.72rem] tracking-[0.08em] text-faint-foreground min-[85rem]:hidden">{c.label}</span>
            <CoverageChips items={entry.coverage[c.key]} />
          </TableCell>
        ))}
        <TableCell className="py-2.5 pr-3 pl-0 whitespace-normal max-[85rem]:col-span-2 max-[85rem]:p-0" aria-live="polite">
          {busy ? (
            <span className="font-label text-[0.72rem] tracking-[0.06em] text-faint-foreground">Saving...</span>
          ) : (
            <LastChange entry={entry} clock={clock} landed={landed === entry.key} />
          )}
        </TableCell>
        <TableCell className="px-0 py-2.5 whitespace-normal max-[85rem]:col-start-2 max-[85rem]:row-start-1 max-[85rem]:p-0">
          <FlagStateControl
            entry={entry}
            shown={row.shown}
            busy={busy}
            panel={panel}
            panelId={panelId}
            hasDraft={draft.trim() !== ""}
            onReason={() => row.showPanel(panel === "reason" ? null : "reason")}
            onPick={row.pick}
          />
        </TableCell>
      </TableRow>
      {(panel || error) && (
        <TableRow className="max-[85rem]:block">
          <TableCell colSpan={6} id={panelId} className="px-0 pt-0.5 pb-3.5 whitespace-normal max-[85rem]:block">
            <div className="ml-auto max-w-[42rem]">
              {panel === "confirm" ? (
                <OffConfirm {...field} busy={busy} onConfirm={() => row.save("off")} onCancel={row.cancel} />
              ) : panel === "reason" ? (
                <ReasonEditor {...field} onClose={() => row.showPanel(null)} />
              ) : null}
              {error && (
                <p role="alert" className="mt-2 text-sm text-destructive">
                  {error}
                </p>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
