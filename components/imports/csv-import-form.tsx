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

      <ImportUploadErrors error={state.error} rowErrors={state.rowErrors} />
    </form>
  );
}
