import type { DatePrecision, Release } from "@/lib/api/types";
import type { GameEditSection } from "./engine";

// Releases (spec api#437, www#161): every Release of the game. IGDB Releases
// are read-only (the IGDB refresh owns them); Manual Releases are added,
// edited and deleted. A vague date sits on the first day of its period and
// a TBA Release has none, as the API requires.

// What an Admin sets on a Manual Release, with the platform's and region's
// names so a staged one can be shown before it is saved.
export type ReleaseDraft = Pick<
  Release,
  | "platform_id"
  | "platform_code"
  | "platform_name"
  | "region_id"
  | "region_code"
  | "region_name"
  | "format"
  | "notes"
  | "release_date"
  | "date_precision"
>;

// What the API's create and update take.
export interface ReleaseFields {
  platform_id: number;
  region_id: number;
  format: string | null;
  notes: string | null;
  release_date: string | null;
  date_precision: DatePrecision;
}

export interface ReleasesStage {
  // New Manual Releases, keyed for the page until they are saved.
  added: { key: string; draft: ReleaseDraft }[];
  // Edited Manual Releases, by release id.
  edited: Record<number, ReleaseDraft>;
  // Manual Releases to delete, by release id.
  deleted: number[];
}

export type ReleaseCall =
  | { kind: "release.create"; key: string; fields: ReleaseFields }
  | { kind: "release.update"; releaseId: number; fields: Partial<ReleaseFields> }
  | { kind: "release.delete"; releaseId: number };

export const RELEASE_FORMATS = ["Physical", "Digital"] as const;
export const DATE_PRECISIONS: DatePrecision[] = ["day", "month", "quarter", "year", "tba"];
export const DATE_PRECISION_LABELS: Record<DatePrecision, string> = {
  day: "Day",
  month: "Month",
  quarter: "Quarter",
  year: "Year",
  tba: "TBA",
};

const EMPTY: ReleasesStage = { added: [], edited: {}, deleted: [] };

export function emptyReleaseDraft(): ReleaseDraft {
  return {
    platform_id: 0,
    platform_code: "",
    platform_name: "",
    region_id: 0,
    region_code: "",
    region_name: "",
    format: null,
    notes: null,
    release_date: null,
    date_precision: "day",
  };
}

export function releaseDraft(release: Release): ReleaseDraft {
  const { platform_id, platform_code, platform_name, region_id, region_code, region_name } = release;
  const { format, notes, release_date, date_precision } = release;
  return { platform_id, platform_code, platform_name, region_id, region_code, region_name, format, notes, release_date, date_precision };
}

// The first day of the date's period at this precision; null for TBA.
export function periodStart(date: string | null, precision: DatePrecision): string | null {
  if (!date || precision === "tba") return null;
  const [y, m, d] = date.slice(0, 10).split("-");
  if (precision === "day") return `${y}-${m}-${d}`;
  if (precision === "month") return `${y}-${m}-01`;
  if (precision === "year") return `${y}-01-01`;
  const first = Math.floor((Number(m) - 1) / 3) * 3 + 1;
  return `${y}-${String(first).padStart(2, "0")}-01`;
}

// The draft as the API takes it: blank notes are null, the date on its
// period's first day.
function fields(draft: ReleaseDraft): ReleaseFields {
  return {
    platform_id: draft.platform_id,
    region_id: draft.region_id,
    format: draft.format || null,
    notes: draft.notes?.trim() ? draft.notes : null,
    release_date: periodStart(draft.release_date, draft.date_precision),
    date_precision: draft.date_precision,
  };
}

// Only what changed; a date and its Date Precision always travel together.
function changedFields(release: Release, draft: ReleaseDraft): Partial<ReleaseFields> {
  const was = fields(releaseDraft(release));
  const now = fields(draft);
  const out: Partial<ReleaseFields> = {};
  for (const f of ["platform_id", "region_id", "format", "notes"] as const) {
    if (now[f] !== was[f]) Object.assign(out, { [f]: now[f] });
  }
  if (now.release_date !== was.release_date || now.date_precision !== was.date_precision) {
    out.release_date = now.release_date;
    out.date_precision = now.date_precision;
  }
  return out;
}

const manualRelease = (loaded: Release[], id: number) =>
  loaded.find((r) => r.release_id === id && r.source === "manual");

// The stage's edits and deletes that still apply: Manual Releases only.
function effective(loaded: Release[], staged: ReleasesStage) {
  const deleted = staged.deleted.filter((id) => manualRelease(loaded, id));
  const edited: [Release, ReleaseDraft][] = [];
  for (const [id, draft] of Object.entries(staged.edited)) {
    const release = manualRelease(loaded, Number(id));
    if (release && !deleted.includes(release.release_id) && Object.keys(changedFields(release, draft)).length > 0) {
      edited.push([release, draft]);
    }
  }
  return { deleted, edited };
}

// ─── Staging (the page's edits; an IGDB Release is never staged) ─────────

export function editRelease(loaded: Release[], stage: ReleasesStage, id: number, draft: ReleaseDraft): ReleasesStage {
  const release = manualRelease(loaded, id);
  if (!release) return stage;
  const edited = { ...stage.edited };
  if (Object.keys(changedFields(release, draft)).length > 0) edited[id] = draft;
  else delete edited[id];
  return { ...stage, edited };
}

export function deleteRelease(loaded: Release[], stage: ReleasesStage, id: number): ReleasesStage {
  if (!manualRelease(loaded, id) || stage.deleted.includes(id)) return stage;
  const edited = { ...stage.edited };
  delete edited[id];
  return { ...stage, edited, deleted: [...stage.deleted, id] };
}

// Drops a Release's staged edit or delete.
export function undoRelease(stage: ReleasesStage, id: number): ReleasesStage {
  const edited = { ...stage.edited };
  delete edited[id];
  return { ...stage, edited, deleted: stage.deleted.filter((d) => d !== id) };
}

export function addRelease(stage: ReleasesStage, key: string, draft: ReleaseDraft): ReleasesStage {
  return { ...stage, added: [...stage.added, { key, draft }] };
}

export function editAddedRelease(stage: ReleasesStage, key: string, draft: ReleaseDraft): ReleasesStage {
  return { ...stage, added: stage.added.map((a) => (a.key === key ? { key, draft } : a)) };
}

export function removeAddedRelease(stage: ReleasesStage, key: string): ReleasesStage {
  return { ...stage, added: stage.added.filter((a) => a.key !== key) };
}

// The stage, or undefined when it holds nothing.
export function releasesStageOrNone(stage: ReleasesStage): ReleasesStage | undefined {
  return stage.added.length + Object.keys(stage.edited).length + stage.deleted.length > 0 ? stage : undefined;
}

export function releasesStage(stage: ReleasesStage | undefined): ReleasesStage {
  return stage ?? EMPTY;
}

// ─── The section ─────────────────────────────────────────────────────────

function draftError(draft: ReleaseDraft): string | null {
  if (!draft.platform_id || !draft.region_id) return "Every Manual Release needs a platform and a region.";
  if (draft.date_precision !== "tba" && !draft.release_date) return "Give every dated Release a date, or make it TBA.";
  return null;
}

function toRelease(draft: ReleaseDraft, base: Pick<Release, "release_id" | "game_id">): Release {
  return { ...base, ...draft, ...fields(draft), source: "manual" };
}

export const releasesSection: GameEditSection<Release[], ReleasesStage, ReleaseCall> = {
  label: "Releases",
  access: "admin",
  changes: (loaded, staged) => {
    const { deleted, edited } = effective(loaded, staged);
    return staged.added.length + edited.length + deleted.length;
  },
  check: (staged, loaded) => {
    const drafts = [...staged.added.map((a) => a.draft), ...effective(loaded, staged).edited.map(([, d]) => d)];
    for (const draft of drafts) {
      const error = draftError(draft);
      if (error) return error;
    }
    return null;
  },
  plan: (loaded, staged) => {
    const { deleted, edited } = effective(loaded, staged);
    return [
      ...staged.added.map((a): ReleaseCall => ({ kind: "release.create", key: a.key, fields: fields(a.draft) })),
      ...edited.map(([r, d]): ReleaseCall => ({ kind: "release.update", releaseId: r.release_id, fields: changedFields(r, d) })),
      ...deleted.map((id): ReleaseCall => ({ kind: "release.delete", releaseId: id })),
    ];
  },
  apply: (loaded, staged) => {
    const { deleted, edited } = effective(loaded, staged);
    const drafts = new Map(edited.map(([r, d]) => [r.release_id, d]));
    const gameId = loaded[0]?.game_id ?? 0;
    return [
      ...loaded
        .filter((r) => !deleted.includes(r.release_id))
        .map((r) => (drafts.has(r.release_id) ? toRelease(drafts.get(r.release_id)!, r) : r)),
      // Saved, but their ids come with the section's reload.
      ...staged.added.map((a, i) => toRelease(a.draft, { release_id: -(i + 1), game_id: gameId })),
    ];
  },
  remaining: (_loaded, staged, saved) => {
    const created = new Set(saved.flatMap((c) => (c.kind === "release.create" ? [c.key] : [])));
    const done = new Set(saved.flatMap((c) => (c.kind === "release.create" ? [] : [c.releaseId])));
    const edited = Object.fromEntries(Object.entries(staged.edited).filter(([id]) => !done.has(Number(id))));
    return {
      added: staged.added.filter((a) => !created.has(a.key)),
      edited,
      deleted: staged.deleted.filter((id) => !done.has(id)),
    };
  },
};
