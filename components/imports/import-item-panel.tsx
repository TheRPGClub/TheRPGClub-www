"use client";

import type { ImportActionResult } from "@/app/actions/imports";
import type { ImportItem, ImportReview } from "@/lib/api/types";
import type { ImportKind } from "@/lib/imports/kinds";
import { ImportMatchPanel } from "@/components/imports/import-match-panel";
import { CompletionatorItemPanel } from "@/components/imports/completionator-item-panel";

// Runs one item action for the review loop: shows `label` while it runs,
// surfaces errors, and recovers from a stale row or a stopped import. On
// success the loop calls `advance` for the next row, unless `show` returns a
// review payload to display instead (e.g. `remap` results).
export type ImportPerform = <T>(
  label: string,
  op: () => Promise<ImportActionResult<T>>,
  show?: (data: T) => ImportReview | null,
) => Promise<void>;

export interface ImportItemPanelProps {
  kind: ImportKind;
  userId: string;
  review: ImportReview & { item: ImportItem };
  disabled: boolean;
  perform: ImportPerform;
}

// The per-item review UI. CSV and Steam share the match panel (candidates,
// remap, GameDB pick, IGDB, skip). Completionator has its own steps (match,
// then add/update the completion).
const ITEM_PANELS: Record<ImportKind, React.ComponentType<ImportItemPanelProps>> = {
  csv: ImportMatchPanel,
  steam: ImportMatchPanel,
  completionator: CompletionatorItemPanel,
};

export function ImportItemPanel(props: ImportItemPanelProps) {
  const Panel = ITEM_PANELS[props.kind];
  return <Panel {...props} />;
}
