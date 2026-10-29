import type { InvalidCsvRowError } from "@/lib/api/types";

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
          <table className="w-full text-left text-sm">
            <thead className="font-label text-[0.78rem] tracking-[0.08em] text-paper-mute">
              <tr>
                <th className="py-1 pr-3 font-medium">Line</th>
                <th className="py-1 pr-3 font-medium">Column</th>
                <th className="py-1 font-medium">Problem</th>
              </tr>
            </thead>
            <tbody>
              {rowErrors.map((e, i) => {
                const wholeFile = e.column === "file" || e.row_index === null;
                return (
                  <tr key={`${e.row_index}-${e.column}-${i}`} className="border-t border-destructive/20 align-top text-paper-dim">
                    <td className="py-1 pr-3 tabular-nums">{wholeFile ? "–" : e.row_index}</td>
                    <td className="py-1 pr-3 font-mono text-xs text-paper">
                      {e.column === "file" ? <span className="font-sans">Whole file</span> : e.column}
                    </td>
                    <td className="py-1">{e.message}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
