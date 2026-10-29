import type { CollectionCsvImportItem, ImportItem } from "@/lib/api/types";
import type { ImportKind } from "@/lib/imports/kinds";

// The source data of the row under review, per import kind. Steam and
// Completionator add their case here.
export function ImportItemDetails({ kind, item }: { kind: ImportKind; item: ImportItem }) {
  if (kind === "csv") return <CsvItemDetails item={item as CollectionCsvImportItem} />;
  return null;
}

function CsvItemDetails({ item }: { item: CollectionCsvImportItem }) {
  const platformUnresolved = item.raw_platform && item.platform_id === null;
  const rows: [string, React.ReactNode][] = [
    [
      "Platform",
      item.raw_platform ? (
        <>
          {item.raw_platform}
          {platformUnresolved && (
            <span className="text-muted-foreground"> (not recognized: added without a platform)</span>
          )}
        </>
      ) : (
        <span className="text-muted-foreground">None</span>
      ),
    ],
    ["Ownership", item.ownership_type ?? item.raw_ownership_type ?? "Digital"],
  ];
  if (item.raw_note) rows.push(["Note", item.raw_note]);
  if (item.error_text) rows.push(["Problem", item.error_text]);

  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
      {rows.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="min-w-0 break-words">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
