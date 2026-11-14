import { useId } from "react";
import type { FeatureFlagEntry } from "@/lib/feature-flags";
import { SectionHeading } from "@/components/templates/page-header";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { COVERAGE } from "./flag-cells";
import { FlagRow, type RowProps } from "./flag-row";

const HEAD = "h-auto border-b pt-2 pb-1.5 pr-3 pl-0 align-bottom text-[0.72rem] whitespace-normal";
const COVER = "border-l pl-3";

// One department of the desk (Core or Hideable features): a section heading
// over the ledger. Both departments share the columns, so a Feature's
// coverage, last change and state line up down the page; the first one names
// the coverage group over its three columns.
export function FlagDepartment({
  title,
  entries,
  groupHead = false,
  ...row
}: RowProps & { title: string; entries: FeatureFlagEntry[]; groupHead?: boolean }) {
  const headingId = useId();
  if (entries.length === 0) return null;
  const coverHeads = COVERAGE.map((c) => (
    <TableHead key={c.key} scope="col" variant="grouped" className={cn(HEAD, COVER)}>
      {c.label}
    </TableHead>
  ));
  const span = groupHead ? 2 : undefined;
  return (
    <section aria-labelledby={headingId}>
      <SectionHeading title={<span id={headingId}>{title}</span>} />
      <Table
        variant="ledger"
        containerClassName="overflow-visible"
        className="caption-top text-[length:inherit] max-[85rem]:block min-[85rem]:table-fixed"
      >
        <colgroup className="max-[85rem]:hidden">
          <col className="w-[10.5rem]" />
          <col />
          <col />
          <col />
          <col className="w-[11.5rem]" />
          <col className="w-[15.25rem]" />
        </colgroup>
        <TableHeader className="max-[85rem]:sr-only [&_tr]:border-b-0">
          <TableRow>
            <TableHead scope="col" rowSpan={span} className={HEAD}>
              Feature
            </TableHead>
            {groupHead ? (
              <TableHead scope="colgroup" colSpan={3} variant="grouped" className={cn(HEAD, COVER, "pt-2.5 pb-1")}>
                One flag switches
                <span className="ml-2 font-semibold tracking-[0.06em] text-faint-foreground">all three at once</span>
              </TableHead>
            ) : (
              coverHeads
            )}
            <TableHead scope="col" rowSpan={span} className={HEAD}>
              Last change
            </TableHead>
            <TableHead scope="col" rowSpan={span} className={cn(HEAD, "pr-0 text-right")}>
              State
            </TableHead>
          </TableRow>
          {groupHead && <TableRow>{coverHeads}</TableRow>}
        </TableHeader>
        <TableBody className="max-[85rem]:block [&_tr:last-child]:border-b">
          {entries.map((entry) => (
            <FlagRow key={entry.key} entry={entry} {...row} />
          ))}
        </TableBody>
      </Table>
    </section>
  );
}
