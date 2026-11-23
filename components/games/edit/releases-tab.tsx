"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { Release } from "@/lib/api/types";
import {
  addRelease,
  deleteRelease,
  editAddedRelease,
  editRelease,
  emptyReleaseDraft,
  releasesStage,
  releasesStageOrNone,
  removeAddedRelease,
  undoRelease,
  type ReleaseDraft,
  type ReleasesStage,
} from "@/lib/games/game-edit/releases";
import { releaseRows, type ReleaseRow as Row } from "@/lib/games/game-edit/release-rows";
import type { ReleaseOptions } from "@/lib/games/game-edit/release-options";
import { utcToday } from "@/lib/releases";
import { localKey } from "@/lib/local-key";
import { Button } from "@/components/ui/button";
import { EditSection } from "@/components/games/edit/edit-section";
import { RefreshReleases } from "@/components/games/edit/refresh-releases";
import { ReleaseEditor } from "@/components/games/edit/release-editor";
import { ReleaseRow } from "@/components/games/edit/release-row";

// The Releases tab (spec api#437, design www#156 round 3): one table grouped
// by platform. IGDB Releases are read-only; Manual Releases open inline to
// edit, or stage a delete; a new Manual Release is staged as an open row.
// Refresh from IGDB runs at once, and waits while anything here is staged.
export function ReleasesTab({
  gameId,
  loaded,
  staged,
  error,
  options,
  canRefresh,
  onStage,
  onReload,
}: {
  gameId: number;
  loaded: Release[];
  staged: ReleasesStage | undefined;
  error?: string;
  options: ReleaseOptions;
  // The game has an IGDB link to refresh from.
  canRefresh: boolean;
  onStage: (next: ReleasesStage | undefined) => void;
  onReload: (releases: Release[]) => void;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const stage = releasesStage(staged);
  const put = (next: ReleasesStage) => onStage(releasesStageOrNone(next));
  const groups = releaseRows(loaded, staged);
  const today = utcToday();

  const idOf = (row: Row) => row.release?.release_id ?? 0;
  const keyOf = (row: Row) => row.id.slice("new:".length);
  const change = (row: Row, draft: ReleaseDraft) =>
    put(row.release ? editRelease(loaded, stage, idOf(row), draft) : editAddedRelease(stage, keyOf(row), draft));

  const actions = (
    <>
      {canRefresh && <RefreshReleases gameId={gameId} dirty={staged !== undefined} onReload={onReload} />}
      <Button variant="outline" size="sm" onClick={() => put(addRelease(stage, localKey("release"), emptyReleaseDraft()))}>
        <Plus data-icon="inline-start" />
        Add a Manual Release
      </Button>
    </>
  );

  return (
    <EditSection title="Releases" actions={actions} error={error}>
      {groups.length === 0 ? (
        <p className="py-6 text-[0.95rem] text-faint-foreground">No Releases listed yet.</p>
      ) : (
        <div>
          {groups.map((group) => (
            <section
              key={group.platformId}
              aria-label={group.platformName || "New Releases"}
              className="grid border-b border-border sm:grid-cols-[8.5rem_minmax(0,1fr)]"
            >
              <h3 className="font-label pt-2.5 pb-1 text-[0.9rem] leading-[1.2] font-extrabold tracking-[0.06em] sm:py-2.75">
                {group.platformName || "New"}
              </h3>
              <ul>
                {group.rows.map((row) => (
                  <ReleaseRow
                    key={row.id}
                    row={row}
                    today={today}
                    editor={
                      row.state === "added" || open === row.id ? (
                        <ReleaseEditor draft={row.draft} options={options} onChange={(d) => change(row, d)} />
                      ) : undefined
                    }
                    onEdit={() => setOpen(open === row.id ? null : row.id)}
                    onDelete={() =>
                      put(row.release ? deleteRelease(loaded, stage, idOf(row)) : removeAddedRelease(stage, keyOf(row)))
                    }
                    onUndo={() => put(undoRelease(stage, idOf(row)))}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </EditSection>
  );
}
