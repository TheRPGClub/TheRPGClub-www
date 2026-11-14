import type { CollectionCsvImport } from "@/lib/api/types";
import { ImportPage } from "@/components/templates/import-page";
import { ImportingLine } from "@/components/templates/import-step";
import { CsvImportStart } from "@/components/imports/csv-import-start";

export default async function CollectionCsvImportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <ImportPage<CollectionCsvImport>
      kind="csv"
      userId={id}
      intro={(active) => <ImportingLine name={active.source_file_name} />}
      form={<CsvImportStart userId={id} />}
    />
  );
}
