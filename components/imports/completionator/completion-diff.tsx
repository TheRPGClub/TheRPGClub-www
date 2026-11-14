import type { CompletionatorUpdateField } from "@/lib/api/types";
import { UPDATE_FIELD_LABELS, completionDiffRows } from "@/lib/imports/completionator";
import type { CompletionatorReview } from "@/components/imports/completionator/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// The comparison's cells sit tight and wrap, top-aligned.
const HEAD = "h-auto px-0 py-1 pr-3";
const CELL = "h-auto px-0 py-1.5 pr-3 align-top whitespace-normal";

// The member's completion beside the file's row, the values that differ
// marked in yellow.
export function CompletionDiff({
  review,
  highlight,
}: {
  review: CompletionatorReview;
  highlight: CompletionatorUpdateField[];
}) {
  if (!review.existing_completion) return null;
  const rows = completionDiffRows(review.existing_completion, review.item);
  return (
    <Table variant="inset" className="text-left">
      <TableHeader className="text-[0.78rem]">
        <TableRow>
          <TableHead className={HEAD} />
          <TableHead className={HEAD}>Your completion</TableHead>
          <TableHead className={`${HEAD} pr-0`}>In the file</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(([field, current, incoming]) => (
          <TableRow key={field}>
            <TableHead scope="row" className={CELL}>
              {UPDATE_FIELD_LABELS[field]}
            </TableHead>
            <TableCell className={CELL}>{current}</TableCell>
            <TableCell className={`${CELL} pr-0`}>
              {highlight.includes(field) ? (
                <span className="font-semibold text-highlight">{incoming}</span>
              ) : (
                incoming
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
