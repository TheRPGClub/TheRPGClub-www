import type { CompletionatorImport } from "@/lib/api/types";
import { ImportPage, ImportingLine } from "@/components/imports/import-page";
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
          <section className="space-y-3 rounded-2xl border bg-card p-5 shadow-sm">
            <h2 className="font-semibold">1. Export from Completionator</h2>
            <p className="text-sm text-muted-foreground">
              On Completionator, export your completed games as a CSV file. Use
              the file as it is: the columns are read in order (name, platform,
              region, type, time, date).
            </p>
          </section>

          <section className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm">
            <div className="space-y-1">
              <h2 className="font-semibold">2. Upload it</h2>
              <p className="text-sm text-muted-foreground">
                Rows with one clear GameDB match and a known platform are added
                straight away, and rows you already logged with the same details
                are skipped. You review the rest one at a time: choose the game,
                check the completion, or pick what to update on one you already have.
              </p>
            </div>
            <CsvImportForm userId={id} kind="completionator" />
          </section>
        </>
      }
    />
  );
}
