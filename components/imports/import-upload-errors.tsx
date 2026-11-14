import type { InvalidCsvRowError } from "@/lib/api/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// The ledger's cells sit tight and wrap, top-aligned.
const HEAD = "h-auto px-0 py-1 pr-3";
const CELL = "px-0 py-1 pr-3 align-top whitespace-normal";

// A rejected upload's problems (422 `invalid_csv`), one per row, so the member
// can fix the file in one go. A whole-file problem has column "file" (and
// row_index 1, or null from older APIs): it shows without a line number.
export function ImportUploadErrors({
  error,
  rowErrors,
}: {
  error: string | null;
  rowErrors: InvalidCsvRowError[];
}) {
  if (!error) return null;
  return (
    <div role="alert" className="space-y-2.5 rounded-sm border border-destructive/40 bg-destructive/8 px-4 py-3">
      <p className="text-sm font-semibold text-destructive">{error}</p>
      {rowErrors.length > 0 && (
        <div className="max-h-72 overflow-y-auto">
          <Table variant="destructive" className="text-left">
            <TableHeader className="text-[0.78rem]">
              <TableRow>
                <TableHead className={HEAD}>Line</TableHead>
                <TableHead className={HEAD}>Column</TableHead>
                <TableHead className={`${HEAD} pr-0`}>Problem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rowErrors.map((e, i) => {
                const wholeFile = e.column === "file" || e.row_index === null;
                return (
                  <TableRow key={`${e.row_index}-${e.column}-${i}`}>
                    <TableCell className={`${CELL} tabular-nums`}>{wholeFile ? "–" : e.row_index}</TableCell>
                    <TableCell className={`${CELL} font-mono text-xs`}>
                      {e.column === "file" ? (
                        <span className="font-sans text-foreground">Whole file</span>
                      ) : (
                        <span className="text-foreground">{e.column}</span>
                      )}
                    </TableCell>
                    <TableCell className={`${CELL} pr-0`}>{e.message}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
