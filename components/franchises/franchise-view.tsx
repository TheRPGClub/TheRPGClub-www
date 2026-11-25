"use client";

import { franchiseLayout } from "@/lib/franchises/page";
import { progressTabCount } from "@/lib/franchises/progress";
import type { FranchiseChange, FranchisePage, FranchiseProgressView } from "@/lib/franchises/types";
import { useFranchiseEditor } from "@/hooks/use-franchise-editor";
import { Button } from "@/components/ui/button";
import { FranchiseAdminTools } from "@/components/franchises/franchise-admin-tools";
import { FranchiseGames } from "@/components/franchises/franchise-games";
import { FranchiseHeader } from "@/components/franchises/franchise-header";
import { FranchiseHistory } from "@/components/franchises/franchise-history";
import { FranchiseProgressTab } from "@/components/franchises/progress/franchise-progress-tab";
import { FranchiseSwitch, type FranchiseViewKey } from "@/components/franchises/franchise-switch";
import { LinkGameDialog } from "@/components/franchises/link-game-dialog";
import { SeriesLine } from "@/components/franchises/series-line/series-line";

// /franchises/:id (spec api#442, design pick 6: 6B's page with 6C's switch).
// Games is The Series Line (spec api#487); Edit Franchise swaps it for the
// editor (the numbered run, the box set and the Add-ons drop zone), where every press saves at
// once. History is the change line with Undo. History is read through the
// API's Regulars-and-above gate. Progress (pick 1E with 1E1) is the
// viewer's dials, cover wall and the Members table, for everyone the
// `franchise_progress` Feature is open to.
export function FranchiseView({
  page,
  history,
  view,
  progress = null,
  now,
  canStartChallenge = false,
}: {
  page: FranchisePage;
  history: { changes: FranchiseChange[]; total: number } | null;
  view: FranchiseViewKey;
  // Null when the Feature is closed to the viewer or its read failed.
  progress?: FranchiseProgressView | null;
  now: string;
  // The viewer may host Challenges (the Feature is open to them).
  canStartChallenge?: boolean;
}) {
  const editor = useFranchiseEditor(page.franchise_id);
  const layout = franchiseLayout(page);
  const shown: FranchiseViewKey = (view === "history" && history) || (view === "progress" && progress) ? view : "games";
  const games = layout.counts.mainline + layout.counts.other + layout.counts.addOns;
  const onPage = new Set([...page.games.mainline, ...page.games.other, ...page.games.add_ons.flatMap((g) => g.games)].map((g) => g.game_id));
  const editing = editor.editing && shown === "games";

  return (
    <div className="pb-10">
      <FranchiseHeader
        page={page}
        counts={layout.counts}
        editor={editor}
        canToggleEdit={shown === "games"}
        canStartChallenge={canStartChallenge}
      />
      {editing && page.viewer.can_admin && (
        <div className="mt-4">
          <FranchiseAdminTools franchise={page} games={games} />
        </div>
      )}
      {history || progress ? (
        <FranchiseSwitch
          franchiseId={page.franchise_id}
          current={shown}
          views={[
            { key: "games", label: "Games", count: games },
            ...(progress ? [{ key: "progress" as const, label: "Progress", count: progressTabCount(progress.yours.meters) }] : []),
            ...(history ? [{ key: "history" as const, label: "History", count: history.total }] : []),
          ]}
          action={
            editing && (
              <LinkGameDialog franchiseName={page.name} onPage={onPage} editor={editor} trigger={<Button variant="outline" size="sm" />} />
            )
          }
        />
      ) : (
        <div className="mt-8" />
      )}
      {shown === "history" && history ? (
        <FranchiseHistory changes={history.changes} total={history.total} now={now} editor={editor} />
      ) : shown === "progress" && progress ? (
        <FranchiseProgressTab franchiseId={page.franchise_id} progress={progress} />
      ) : !editing ? (
        <SeriesLine layout={layout} />
      ) : (
        <FranchiseGames
          layout={layout}
          editor={{ ...editor, editing }}
          addTile={
            editing && (
              <LinkGameDialog franchiseName={page.name} onPage={onPage} editor={editor} trigger={<Button variant="add" size="tile" />} />
            )
          }
        />
      )}
    </div>
  );
}
