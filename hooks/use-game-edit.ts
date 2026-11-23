"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateGameTextAction } from "@/app/actions/game-edit";
import {
  gameEditSave,
  saveSummary,
  type GameEditRecord,
  type GameEditSectionKey,
  type GameEditStage,
  type GameEditSteps,
  type GameEditViewer,
} from "@/lib/games/game-edit";

export interface GameEditSaveNotice {
  title: string;
  // The sections that didn't save, by name.
  failed: string[];
}

// The Game Edit page's staged state (spec api#437). Every section stages its
// edits here; the sticky bar counts them, Discard drops them, and Save all
// runs the Game Edit save module with the server actions as its steps. A
// failed section keeps its edits and shows its error until the next save.
export function useGameEdit(gameId: number, loaded: GameEditRecord, viewer: GameEditViewer) {
  const router = useRouter();
  const [record, setRecord] = useState(loaded);
  const [stage, setStage] = useState<GameEditStage>({});
  const [errors, setErrors] = useState<Partial<Record<GameEditSectionKey, string>>>({});
  const [notice, setNotice] = useState<GameEditSaveNotice | null>(null);
  const [saving, startSaving] = useTransition();

  const steps: GameEditSteps = {
    "game.update": (call) => updateGameTextAction(gameId, call.fields),
  };
  const changes = gameEditSave.changes(record, stage, viewer);

  // Sets (or, with undefined, drops) one section's staged edits.
  function stageSection<K extends GameEditSectionKey>(key: K, staged: GameEditStage[K] | undefined) {
    setStage((prev) => {
      const next = { ...prev };
      if (staged === undefined) delete next[key];
      else next[key] = staged;
      return next;
    });
  }

  function discard() {
    setStage({});
    setErrors({});
    setNotice(null);
  }

  function save() {
    startSaving(async () => {
      const outcome = await gameEditSave.run(record, stage, viewer, steps);
      setRecord(outcome.record);
      setStage(outcome.staged);
      const failed = outcome.sections.filter((s) => s.status === "failed");
      setErrors(Object.fromEntries(failed.map((s) => [s.key, s.error])));
      setNotice(failed.length > 0 ? { title: saveSummary(outcome).split(":")[0], failed: failed.map((s) => s.label) } : null);
      router.refresh();
    });
  }

  return {
    record,
    stage,
    stageSection,
    changes,
    errors,
    notice,
    dismissNotice: () => setNotice(null),
    saving,
    discard,
    save,
    // The bar's breakdown: "Text & video 2".
    breakdown: (Object.entries(changes.bySection) as [GameEditSectionKey, number][]).map(
      ([key, n]) => `${gameEditSave.label(key)} ${n}`,
    ),
  };
}

export type GameEdit = ReturnType<typeof useGameEdit>;
