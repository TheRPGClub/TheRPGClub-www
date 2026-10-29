import type {
  CollectionCsvImportItem,
  CompletionatorImportItem,
  ImportItem,
  SteamCollectionImportItem,
  ImportReview,
  ImportStatus,
  ImportSummary,
} from "@/lib/api/types";

// The import kinds a member can run from the website. Each kind's API
// endpoints share one shape, so the review loop, the actions and the IGDB
// route only need the two resource names below:
//   GET   /api/v1/users/:uid/<imports>/active
//   PATCH /api/v1/<imports>/:id            {status}
//   POST  /api/v1/<imports>/:id/advance
//   POST  /api/v1/<items>/:id/apply|skip|remap
//   GET   /api/v1/<items>/:id/igdb_candidates?q=
// Client-safe: no server imports here.

export type ImportKind = "csv" | "steam" | "completionator";

// An item field that holds the source title, in any kind's item type.
type ItemTitleField =
  | keyof CollectionCsvImportItem
  | keyof SteamCollectionImportItem
  | keyof CompletionatorImportItem;

export interface ImportKindConfig {
  label: string;
  description: string;
  // The item field the review shows and pre-fills searches with.
  titleField: ItemTitleField;
  // What one item is called to the member: a CSV row, a Steam game, a
  // Completionator entry.
  itemNoun: { one: string; other: string };
  // API resource names.
  imports: string;
  items: string;
  // Path under /api/v1/<imports>/:id that returns the ImportSummary counts.
  summary: string;
  // Member list subpaths the import writes to (for revalidation and links).
  affects: string[];
}

export const IMPORT_KINDS: Record<ImportKind, ImportKindConfig> = {
  csv: {
    label: "Collection CSV",
    description:
      "Upload a spreadsheet of games you own. Rows with a GameDB or IGDB id, or a single exact title match, are added for you; you review the rest.",
    imports: "collection_csv_imports",
    items: "collection_csv_import_items",
    summary: "summary",
    affects: ["collected-games"],
    titleField: "raw_title",
    itemNoun: { one: "row", other: "rows" },
  },
  steam: {
    label: "Steam library",
    description:
      "Add the games in your Steam library to your collection. Games with a single exact title match are added for you; you review the rest.",
    imports: "steam_collection_imports",
    items: "steam_collection_import_items",
    // Steam has no `summary`; `items/counts` returns the same ImportSummary.
    summary: "items/counts",
    affects: ["collected-games"],
    titleField: "steam_app_name",
    itemNoun: { one: "game", other: "games" },
  },
  completionator: {
    label: "Completionator",
    description:
      "Bring your completions over from a Completionator export. Rows with one clear match and a known platform are added for you; you review the rest.",
    imports: "completionator_imports",
    items: "completionator_import_items",
    summary: "summary",
    affects: ["completed-games"],
    titleField: "game_title",
    itemNoun: { one: "entry", other: "entries" },
  },
};

export const IMPORT_KIND_ORDER: ImportKind[] = ["csv", "steam", "completionator"];

export function isImportKind(value: unknown): value is ImportKind {
  return typeof value === "string" && Object.hasOwn(IMPORT_KINDS, value);
}

// Discord snowflakes only: user ids go into API paths.
export function isMemberId(value: unknown): value is string {
  return typeof value === "string" && /^\d{1,25}$/.test(value);
}

export function isRecordId(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

// --- Paths -----------------------------------------------------------------

export const importsHubHref = (userId: string) => `/members/${userId}/imports`;

export const importKindHref = (userId: string, kind: ImportKind) =>
  `/members/${userId}/imports/${kind}`;

export const activeImportApiPath = (kind: ImportKind, userId: string) =>
  `/api/v1/users/${userId}/${IMPORT_KINDS[kind].imports}/active`;

export const importApiPath = (kind: ImportKind, importId: number) =>
  `/api/v1/${IMPORT_KINDS[kind].imports}/${importId}`;

export const importSummaryApiPath = (kind: ImportKind, importId: number) =>
  `${importApiPath(kind, importId)}/${IMPORT_KINDS[kind].summary}`;

export const importItemApiPath = (kind: ImportKind, itemId: number) =>
  `/api/v1/${IMPORT_KINDS[kind].items}/${itemId}`;

// The www route handler that proxies `igdb_candidates` for a row.
export const igdbSuggestionsHref = (
  kind: ImportKind,
  itemId: number,
  query?: string,
) => {
  const q = query?.trim();
  return `/api/imports/${kind}/items/${itemId}/igdb${q ? `?q=${encodeURIComponent(q)}` : ""}`;
};

// --- Review loop -----------------------------------------------------------

// `advance` stops after a batch of automatic rows and returns no item while
// the import is still active: the client must call it again.
export function shouldAdvanceAgain(review: ImportReview): boolean {
  return review.item === null && review.import.status === "active";
}

export function isOpenImport(status: ImportStatus): boolean {
  return status === "active" || status === "paused";
}

export interface ImportProgress {
  total: number;
  resolved: number;
  pending: number;
  percent: number;
}

export function importProgress(total: number, counts: ImportSummary | null): ImportProgress {
  const pending = counts ? (counts.by_status.pending ?? 0) : total;
  const resolved = Math.max(0, total - pending);
  return {
    total,
    resolved,
    pending,
    percent: total > 0 ? Math.round((resolved / total) * 100) : 0,
  };
}

// The title the review shows and pre-fills searches with.
export function importItemTitle(kind: ImportKind, item: ImportItem): string {
  const title = (item as unknown as Record<string, unknown>)[IMPORT_KINDS[kind].titleField];
  return typeof title === "string" ? title : "";
}

// "1 row", "12 games": a count in the kind's item noun.
export function importItemCount(kind: ImportKind, n: number): string {
  const { one, other } = IMPORT_KINDS[kind].itemNoun;
  return `${n} ${n === 1 ? one : other}`;
}

// "Row", "Game", "Entry": the noun as a heading label.
export function importItemLabel(kind: ImportKind): string {
  const { one } = IMPORT_KINDS[kind].itemNoun;
  return one.charAt(0).toUpperCase() + one.slice(1);
}

// --- Labels ----------------------------------------------------------------

export const IMPORT_STATUS_LABELS: Record<ImportStatus, string> = {
  active: "In progress",
  paused: "Paused",
  completed: "Finished",
  canceled: "Canceled",
};

const RESULT_REASON_LABELS: Record<string, string> = {
  auto_match: "Matched automatically",
  manual_remap: "Chosen by you",
  csv_gamedb_id: "Matched by GameDB id",
  csv_igdb_id: "Imported by IGDB id",
  platform_unresolved: "Added without a platform",
  duplicate: "Already in your collection",
  manual_skip: "Skipped",
  invalid_row: "Invalid id in the file",
  add_failed: "Couldn't be added",
  no_candidate: "No match found",
  // Statuses, for kinds whose summary has no reasons (Completionator).
  added: "Added",
  updated: "Updated",
  skipped: "Skipped",
  failed: "Failed",
  skip_mapped: "Skipped in an earlier Steam import",
};

export function resultReasonLabel(reason: string): string {
  return RESULT_REASON_LABELS[reason] ?? reason.replace(/_/g, " ");
}

// The reason counts worth showing: drops the null/blank key of pending rows.
// Falls back to the status counts when the summary has no reasons.
export function resultReasonRows(counts: ImportSummary | null): [string, number][] {
  if (!counts) return [];
  const source: Record<string, number | undefined> =
    counts.by_result_reason ?? { ...counts.by_status, pending: 0 };
  return Object.entries(source)
    .filter((entry): entry is [string, number] => {
      const [reason, n] = entry;
      return !!reason && reason !== "null" && typeof n === "number" && n > 0;
    })
    .sort((a, b) => b[1] - a[1]);
}

const ERROR_MESSAGES: Record<string, string> = {
  import_not_active: "This import isn't running. Resume it to keep going.",
  item_not_pending: "That row was already resolved.",
  game_not_found: "That game isn't in GameDB anymore.",
  igdb_game_not_found: "IGDB doesn't know that game.",
  game_id_or_igdb_id_required: "Choose a game first.",
  title_required: "Type a title to search for.",
  invalid_igdb_id: "That isn't a valid IGDB id.",
  igdb_not_configured: "IGDB search isn't available right now.",
  igdb_request_failed: "IGDB didn't answer. Try again in a moment.",
  invalid_csv: "The file has problems. Fix the rows below and upload it again.",
  // Completionator
  no_game_matched: "Choose a game for this row first.",
  invalid_completion_type: "Choose a completion type.",
  invalid_platform: "That platform isn't in GameDB. Choose another one.",
  invalid_completed_at: "That date isn't valid.",
  invalid_fields: "Tick at least one value to update.",
  no_existing_completion: "There's no completion to update anymore.",
};

// Turns an API error code (or message) into something a member can act on.
export function importErrorMessage(code: string | null | undefined, status?: number): string {
  if (code && ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];
  if (code && /active or paused import/i.test(code)) {
    return "You already have an import of this kind in progress. Resume or cancel it first.";
  }
  if (code) return code;
  return status ? `Request failed (HTTP ${status}).` : "Something went wrong.";
}
