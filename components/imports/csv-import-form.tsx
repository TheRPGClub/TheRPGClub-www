"use client";

import { useActionState } from "react";
import { Upload } from "lucide-react";
import { startCsvImportAction, type CsvImportFormState } from "@/app/actions/imports";
import { Button } from "@/components/ui/button";

const initialState: CsvImportFormState = { error: null, rowErrors: [] };

// Upload step of the collection CSV import. The API validates the whole file;
// when it rejects it, every row problem is listed so the member can fix the
// file in one go.
export function CsvImportForm({ userId }: { userId: string }) {
  const [state, formAction, pending] = useActionState(
    startCsvImportAction.bind(null, userId),
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="csv-file" className="text-sm font-medium">
          CSV file
        </label>
        <input
          id="csv-file"
          name="file"
          type="file"
          accept=".csv,text/csv"
          required
          className="block w-full text-sm file:mr-3 file:rounded-lg file:border file:border-input file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-muted"
        />
        <p className="text-xs text-muted-foreground">Up to 2 MB.</p>
      </div>

      <Button type="submit" disabled={pending}>
        <Upload /> {pending ? "Checking the file…" : "Start import"}
      </Button>

      {state.error && (
        <div role="alert" className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
          <p className="text-sm text-destructive">{state.error}</p>
          {state.rowErrors.length > 0 && (
            <div className="max-h-72 overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-muted-foreground">
                  <tr>
                    <th className="py-1 pr-3 font-medium">Line</th>
                    <th className="py-1 pr-3 font-medium">Column</th>
                    <th className="py-1 font-medium">Problem</th>
                  </tr>
                </thead>
                <tbody>
                  {state.rowErrors.map((e, i) => (
                    <tr key={`${e.row_index}-${e.column}-${i}`} className="border-t border-destructive/10 align-top">
                      <td className="py-1 pr-3 tabular-nums">{e.row_index ?? "–"}</td>
                      <td className="py-1 pr-3 font-mono text-xs">{e.column}</td>
                      <td className="py-1">{e.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </form>
  );
}
