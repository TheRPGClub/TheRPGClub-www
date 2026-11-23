"use client";

import { useState } from "react";
import type { GameEditRecord, GameEditViewer } from "@/lib/games/game-edit";
import {
  GAME_EDIT_TAB_LABELS,
  gameEditHref,
  gameEditTabNote,
  gameEditTabsFor,
  type GameEditTab,
} from "@/lib/games/game-edit/tabs";
import { useGameEdit } from "@/hooks/use-game-edit";
import { useLeaveGuard } from "@/hooks/use-leave-guard";
import { MastheadTabs } from "@/components/templates/masthead-tabs";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { GameEditBand } from "@/components/games/edit/game-edit-band";
import { gameEditPanels } from "@/components/games/edit/game-edit-panels";
import { SaveBar } from "@/components/games/edit/save-bar";
import { SaveFailedSlip } from "@/components/games/edit/save-failed-slip";

export interface GameEditViewProps {
  gameId: number;
  title: string;
  coverUrl: string | null;
  artUrl: string | null;
  record: GameEditRecord;
  viewer: GameEditViewer;
  // The tab `?tab=` asks for, already checked against the viewer.
  tab: GameEditTab;
}

// /games/:id/edit (spec api#437, design www#156 round 3): the band with the
// six tabs, one section a tab, and the sticky save bar while anything is
// staged. A Regular gets Game Threads alone, without tabs. Leaving with
// staged changes asks first.
export function GameEditView(p: GameEditViewProps) {
  const edit = useGameEdit(p.gameId, p.record, p.viewer);
  const guard = useLeaveGuard(edit.changes.total > 0);
  const [tab, setTab] = useState<GameEditTab>(p.tab);
  const tabs = gameEditTabsFor(p.viewer);

  const panels = gameEditPanels(p.gameId, edit);
  // The tabs' sections in the save module (the rest arrive with www#158-162).
  const counted: Partial<Record<GameEditTab, keyof typeof edit.changes.bySection>> = { text: "text", threads: "threads", versions: "versions", hltb: "hltb" };
  // The band, then any failed save's slip, above the open section.
  const band = (row?: React.ReactNode) => (
    <>
      <GameEditBand gameId={p.gameId} title={p.title} coverUrl={p.coverUrl} artUrl={p.artUrl}>
        {row}
      </GameEditBand>
      {edit.notice && <SaveFailedSlip notice={edit.notice} onDismiss={edit.dismissNotice} />}
    </>
  );

  return (
    <div className="flex flex-col">
      {tabs.length > 1 ? (
        <MastheadTabs
          label="Sections"
          value={tab}
          onValueChange={(next) => {
            setTab(next);
            window.history.replaceState(null, "", gameEditHref(p.gameId, next));
          }}
          frame={band}
          tabs={tabs.map((key) => {
            const section = counted[key];
            const note = gameEditTabNote(section ? (edit.changes.bySection[section] ?? 0) : 0, !!(section && edit.errors[section]));
            return { key, label: GAME_EDIT_TAB_LABELS[key], ...note, panel: panels[key] };
          })}
        />
      ) : (
        <>
          {band()}
          <div className="pt-6">{panels[tabs[0]]}</div>
        </>
      )}
      <SaveBar
        count={edit.changes.total}
        breakdown={edit.breakdown}
        failed={Object.keys(edit.errors).length > 0}
        saving={edit.saving}
        onDiscard={edit.discard}
        onSave={edit.save}
      />
      <ConfirmDialog
        open={guard.leaving !== null}
        onOpenChange={(open) => !open && guard.stay()}
        title="Leave without saving?"
        description={`${edit.changes.total} unsaved change${edit.changes.total === 1 ? "" : "s"} will be lost.`}
        confirmLabel="Leave"
        pendingLabel="Leaving"
        cancelLabel="Stay"
        onConfirm={async () => {
          guard.leave();
          return null;
        }}
      />
    </div>
  );
}
