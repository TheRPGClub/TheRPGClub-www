import { Download } from "lucide-react";
import type { CollectionCsvImport } from "@/lib/api/types";
import { ImportPage, ImportingLine } from "@/components/imports/import-page";
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
          <section className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm">
            <div className="space-y-1">
              <h2 className="font-semibold">1. Fill in the template</h2>
              <p className="text-sm text-muted-foreground">
                One game per row. Rows whose note says EXAMPLE ROW are ignored,
                so you can leave them in.
              </p>
            </div>
            <a
              href={TEMPLATE_HREF}
              download="collection-import-template.csv"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <Download /> Download the template
            </a>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
              {COLUMNS.map(([column, help]) => (
                <div key={column} className="contents">
                  <dt className="font-mono text-xs leading-5">{column}</dt>
                  <dd className="text-muted-foreground">{help}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm">
            <div className="space-y-1">
              <h2 className="font-semibold">2. Upload it</h2>
              <p className="text-sm text-muted-foreground">
                Rows with an id, or with exactly one matching title, are added
                straight away. You choose the game for the rest, one row at a time.
              </p>
            </div>
            <CsvImportForm userId={id} />
          </section>
        </>
      }
    />
  );
}
