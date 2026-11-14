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
import { Input } from "@/components/ui/input";

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
          className="font-label block text-[0.9rem] font-extrabold tracking-[0.06em] text-dim-foreground"
        >
          CSV file
        </label>
        <Input
          id="csv-file"
          name="file"
          type="file"
          accept=".csv,text/csv"
          required
          variant="upload"
          className="block h-auto p-2 text-sm file:mr-3 file:h-8 file:cursor-pointer file:px-3 file:text-[0.9rem]"
        />
        <p className="text-xs text-faint-foreground">Up to 2 MB.</p>
      </div>

      <Button type="submit" variant="highlight" disabled={pending}>
        <Upload data-icon="inline-start" /> {pending ? "Checking the file…" : "Start import"}
      </Button>

      <ImportUploadErrors error={state.error} rowErrors={state.rowErrors} />
    </form>
  );
}
