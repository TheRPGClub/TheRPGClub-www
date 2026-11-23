import type { Release } from "@/lib/api/types";
import { releaseDraft, releasesStage, type ReleaseDraft, type ReleasesStage } from "./releases";

// The Releases tab's table (design www#156 round 3): one group a platform,
// IGDB and Manual Releases together, with the staged new ones in their
// platform's group (a new one with no platform yet opens the table).
// Client-safe.

export interface ReleaseRow {
  // "r12" for a saved Release, "new:<key>" for a staged one.
  id: string;
  source: "igdb" | "manual" | "new";
  // The saved Release, none for a new one.
  release: Release | null;
  // What the row shows: the staged draft when there is one.
  draft: ReleaseDraft;
  state: "saved" | "edited" | "deleting" | "added";
}

export interface ReleaseGroup {
  platformId: number;
  // "" for new Releases still without a platform.
  platformName: string;
  rows: ReleaseRow[];
}

export function releaseRows(loaded: Release[], stage: ReleasesStage | undefined): ReleaseGroup[] {
  const s = releasesStage(stage);
  const rows: ReleaseRow[] = loaded.map((release) => {
    const manual = release.source === "manual";
    const edit = manual ? s.edited[release.release_id] : undefined;
    const deleting = manual && s.deleted.includes(release.release_id);
    return {
      id: `r${release.release_id}`,
      source: release.source,
      release,
      draft: edit ?? releaseDraft(release),
      state: deleting ? "deleting" : edit ? "edited" : "saved",
    };
  });
  const added: ReleaseRow[] = s.added.map((a) => ({
    id: `new:${a.key}`,
    source: "new",
    release: null,
    draft: a.draft,
    state: "added",
  }));

  const groups = new Map<number, ReleaseGroup>();
  if (added.some((r) => !r.draft.platform_id)) groups.set(0, { platformId: 0, platformName: "", rows: [] });
  for (const row of [...rows, ...added]) {
    const id = row.draft.platform_id;
    let group = groups.get(id);
    if (!group) {
      group = { platformId: id, platformName: row.draft.platform_name, rows: [] };
      groups.set(id, group);
    }
    group.rows.push(row);
  }
  return [...groups.values()];
}
