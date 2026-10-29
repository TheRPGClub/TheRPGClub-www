"use client";

import { useActionState } from "react";
import { Upload } from "lucide-react";
import {
  startCsvFileImportAction,
  type CsvFileImportKind,
  type CsvImportFormState,
} from "@/app/actions/imports";
import { ImportUploadErrors } from "@/components/imports/import-upload-errors";
import { Button } from "@/components/ui/button";

const initialState: CsvImportFormState = { error: null, rowErrors: [] };

// Upload step of the CSV-file imports (collection CSV, Completionator). The
// API validates the whole file; when it rejects it, every row problem is listed.
export function CsvImportForm({
  userId,
  kind = "csv",
}: {
  userId: string;
  kind?: CsvFileImportKind;
}) {
  const [state, formAction, pending] = useActionState(
    startCsvFileImportAction.bind(null, kind, userId),
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <label
          htmlFor="csv-file"
          className="font-label block text-[0.9rem] font-extrabold tracking-[0.06em] text-paper-dim"
        >
          CSV file
        </label>
        <input
          id="csv-file"
          name="file"
          type="file"
          accept=".csv,text/csv"
          required
          className="block w-full rounded-sm border border-dashed border-rule-strong bg-ink p-2 text-sm text-paper-dim file:font-label file:mr-3 file:h-8 file:cursor-pointer file:rounded-sm file:border file:border-rule-strong file:bg-ink-3 file:px-3 file:text-[0.9rem] file:font-extrabold file:tracking-[0.06em] file:text-paper hover:file:border-paper-mute"
        />
        <p className="text-xs text-paper-mute">Up to 2 MB.</p>
      </div>

      <Button type="submit" variant="highlight" disabled={pending}>
        <Upload data-icon="inline-start" /> {pending ? "Checking the file…" : "Start import"}
      </Button>

      <ImportUploadErrors error={state.error} rowErrors={state.rowErrors} />
    </form>
  );
}
