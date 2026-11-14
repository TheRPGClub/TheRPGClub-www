import type { CompletionatorImport } from "@/lib/api/types";
import { ImportPage } from "@/components/templates/import-page";
import { ImportingLine } from "@/components/templates/import-step";
import { CompletionatorImportStart } from "@/components/imports/completionator-import-start";

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
      form={<CompletionatorImportStart userId={id} />}
    />
  );
}
