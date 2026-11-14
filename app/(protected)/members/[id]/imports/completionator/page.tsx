import type { CompletionatorImport } from "@/lib/api/types";
import { ImportPage, ImportStep, ImportingLine } from "@/components/imports/import-page";
import { CsvImportForm } from "@/components/imports/csv-import-form";

export default async function CompletionatorImportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <ImportPage<CompletionatorImport>
      kind="completionator"
      userId={id}
      intro={(active) => <ImportingLine name={active.source_filename} />}
      form={
        <>
          <ImportStep
            step={1}
            title="Export from Completionator"
            description="On Completionator, export your completed games as a CSV file. Use the file as it is: the columns are read in order (name, platform, region, type, time, date)."
          />
          <ImportStep
            step={2}
            title="Upload it"
            description="Rows with one clear GameDB match and a known platform are added straight away, and rows you already logged with the same details are skipped. You review the rest one at a time: choose the game, check the completion, or pick what to update on one you already have."
          >
            <CsvImportForm userId={id} kind="completionator" />
          </ImportStep>
        </>
      }
    />
  );
}
