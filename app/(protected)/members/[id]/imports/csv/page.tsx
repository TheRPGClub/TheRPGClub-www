import { Download } from "lucide-react";
import type { CollectionCsvImport } from "@/lib/api/types";
import { ImportPage, ImportStep, ImportingLine } from "@/components/imports/import-page";
import { CsvImportForm } from "@/components/imports/csv-import-form";
import { buttonVariants } from "@/components/ui/button";

const TEMPLATE_HREF = "/templates/collection-import-template.csv";

const COLUMNS: [string, string][] = [
  ["title", "Required. The game's name."],
  ["platform", "Optional. A platform name, abbreviation or id, e.g. PS5 or Switch."],
  ["ownership_type", "Digital, Physical, Subscription or Other. Blank means Digital."],
  ["note", "Optional, up to 500 characters."],
  ["gamedb_id", "Optional. Adds that GameDB game without searching."],
  ["igdb_id", "Optional. Imports that IGDB game. Use gamedb_id or igdb_id, not both."],
];

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
      form={
        <>
          <ImportStep
            step={1}
            title="Fill in the template"
            description="One game per row. Rows whose note says EXAMPLE ROW are ignored, so you can leave them in."
          >
            <a
              href={TEMPLATE_HREF}
              download="collection-import-template.csv"
              className={buttonVariants({ variant: "outline" })}
            >
              <Download data-icon="inline-start" /> Download the template
            </a>
            <dl className="grid grid-cols-[auto_1fr] gap-x-5 border-t border-rule text-sm">
              {COLUMNS.map(([column, help]) => (
                <div key={column} className="contents">
                  <dt className="border-b border-rule py-2 font-mono text-xs leading-5 text-paper">
                    {column}
                  </dt>
                  <dd className="border-b border-rule py-2 text-paper-dim">{help}</dd>
                </div>
              ))}
            </dl>
          </ImportStep>

          <ImportStep
            step={2}
            title="Upload it"
            description="Rows with an id, or with exactly one matching title, are added straight away. You choose the game for the rest, one row at a time."
          >
            <CsvImportForm userId={id} />
          </ImportStep>
        </>
      }
    />
  );
}
