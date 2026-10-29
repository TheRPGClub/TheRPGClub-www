import type {
  CollectionCsvImportItem,
  CompletionatorImportItem,
  ImportItem,
  SteamCollectionImportItem,
} from "@/lib/api/types";
import { formatImportDate, formatPlaytime } from "@/lib/imports/completionator";
import type { ImportKind } from "@/lib/imports/kinds";
import { SteamItemDetails } from "@/components/imports/steam-item-details";
import { DetailList } from "@/components/issue/import-facts";

// The source data of the item under review, per import kind.
const ITEM_DETAILS: Record<ImportKind, (item: ImportItem) => React.ReactNode> = {
  csv: (item) => <CsvItemDetails item={item as CollectionCsvImportItem} />,
  steam: (item) => <SteamItemDetails item={item as SteamCollectionImportItem} />,
  completionator: (item) => <CompletionatorItemDetails item={item as CompletionatorImportItem} />,
};

export function ImportItemDetails({ kind, item }: { kind: ImportKind; item: ImportItem }) {
  return ITEM_DETAILS[kind](item);
}

function CompletionatorItemDetails({ item }: { item: CompletionatorImportItem }) {
  const none = <span className="text-paper-mute">None</span>;
  const rows: [string, React.ReactNode][] = [
    ["Platform", item.platform_name ? [item.platform_name, item.region_name].filter(Boolean).join(" · ") : none],
    [
      "Type",
      item.source_type
        ? `${item.source_type}${item.completion_type && item.completion_type !== item.source_type ? ` (${item.completion_type})` : ""}`
        : (item.completion_type ?? none),
    ],
    ["Finished", formatImportDate(item.completed_at) ?? none],
    ["Playtime", formatPlaytime(item.playtime_hrs) ?? item.time_text ?? none],
  ];
  return <DetailList rows={rows} problem={item.error_text} />;
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
            <span className="text-paper-mute normal-case"> (not recognized: added without a platform)</span>
          )}
        </>
      ) : (
        <span className="text-paper-mute">None</span>
      ),
    ],
    ["Ownership", item.ownership_type ?? item.raw_ownership_type ?? "Digital"],
  ];
  return <DetailList rows={rows} note={item.raw_note} problem={item.error_text} />;
}
