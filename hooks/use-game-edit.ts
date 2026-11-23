"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateGameTextAction, upsertHltbAction } from "@/app/actions/game-edit";
import {
  linkThreadAction,
  linkVersionAction,
  unlinkThreadAction,
  unlinkVersionAction,
  type GameLinkResult,
} from "@/app/actions/game-links";
import {
  deleteGameImageAction,
  listGameImagesAction,
  updateGameImageAction,
  uploadGameImageAction,
} from "@/app/actions/game-images";
import {
  createReleaseAction,
  deleteReleaseAction,
  loadReleasesAction,
  updateReleaseAction,
} from "@/app/actions/game-edit-releases";
import {
  gameEditSave,
  saveSummary,
  type GameEditRecord,
  type GameEditSectionKey,
  type GameEditStage,
  type GameEditSteps,
  type GameEditViewer,
  type StepResult,
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
    "image.upload": (call) => uploadGameImageAction(gameId, imageForm(call.image.file, call.image.kind, call.primary)),
    "image.update": (call) => updateGameImageAction(gameId, call.imageId, call.fields),
    "image.delete": (call) => deleteGameImageAction(gameId, call.imageId),
    "thread.link": (call) => linkThreadAction(call.thread.thread_id, gameId).then(asStep),
    "thread.unlink": (call) => unlinkThreadAction(call.threadId, gameId).then(asStep),
    "release.create": (call) => createReleaseAction(gameId, call.fields),
    "release.update": (call) => updateReleaseAction(gameId, call.releaseId, call.fields),
    "release.delete": (call) => deleteReleaseAction(gameId, call.releaseId),
    "alternate.link": (call) => linkVersionAction(gameId, call.altGameId).then(stepResult),
    "alternate.unlink": (call) => unlinkVersionAction(gameId, call.altGameId).then(stepResult),
    "hltb.upsert": (call) => upsertHltbAction(gameId, call.fields),
  };
  // Sections whose saved record only the API knows (new image and release
  // ids, image URLs): read back after a save, whether it went through or not.
  const reloads: { [K in GameEditSectionKey]?: () => Promise<GameEditRecord[K] | null> } = {
    images: () => listGameImagesAction(gameId),
    releases: () => loadReleasesAction(gameId),
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

  // Puts a section's fresh record in place: after a save (see `reloads`)
  // or after a refresh or lookup a tab ran (an action, not an edit).
  function reloadSection<K extends GameEditSectionKey>(key: K, loaded: GameEditRecord[K]) {
    setRecord((prev) => ({ ...prev, [key]: loaded }));
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
      for (const { key } of outcome.sections) {
        const fresh = await reloads[key]?.();
        if (fresh) reloadSection(key, fresh);
      }
      router.refresh();
    });
  }

  return {
    record,
    stage,
    stageSection,
    reloadSection,
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

// The game page's link actions answer with an optional error.
function stepResult(result: GameLinkResult): StepResult {
  return result.ok ? { ok: true } : { ok: false, error: result.error ?? "Couldn't save that change." };
}

// The game-links actions' answer as a save step's.
function asStep(result: GameLinkResult): StepResult {
  return result.ok ? { ok: true } : { ok: false, error: result.error ?? "That didn't save. Try again." };
}

export type GameEdit = ReturnType<typeof useGameEdit>;

function imageForm(file: File, kind: string, primary: boolean): FormData {
  const form = new FormData();
  form.append("file", file);
  form.append("kind", kind);
  form.append("is_primary", String(primary));
  return form;
}
