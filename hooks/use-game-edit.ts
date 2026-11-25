"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
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
import { loadGameFranchisesAction, loadGameThreadsAction, loadVersionsAction } from "@/app/actions/game-edit-reads";
import {
  createFranchiseWithGameAction,
  linkFranchiseGameAction,
  unlinkFranchiseGameAction,
  type FranchiseResult,
} from "@/app/actions/franchises";
import {
  gameEditSave,
  recordAfterSave,
  saveSummary,
  SECTION_NOT_READ_BACK,
  stageAfterSave,
  withoutUnavailable,
  type GameEditUnavailable,
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
// While Save all runs nothing stages (the tabs are locked, see `saving`). A
// section whose read failed is `unavailable`: it shows why and can't stage.
export function useGameEdit(
  gameId: number,
  loaded: GameEditRecord,
  viewer: GameEditViewer,
  unreadable: GameEditUnavailable = {},
) {
  const router = useRouter();
  const [record, setRecord] = useState(loaded);
  const [rawStage, setStage] = useState<GameEditStage>({});
  const [errors, setErrors] = useState<Partial<Record<GameEditSectionKey, string>>>({});
  const [notice, setNotice] = useState<GameEditSaveNotice | null>(null);
  const [unavailable, setUnavailable] = useState<GameEditUnavailable>(unreadable);
  const [saving, startSaving] = useTransition();
  // Set at the click, before React re-renders with `saving`.
  const savingRef = useRef(false);
  const stage = withoutUnavailable(rawStage, unavailable);

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
    "franchise.create": (call) =>
      createFranchiseWithGameAction(call.name, gameId, call.mainline, parentOption(call.parentGameId)).then(franchiseStep),
    "franchise.link": (call) =>
      linkFranchiseGameAction(call.franchiseId, gameId, call.mainline || undefined, parentOption(call.parentGameId)).then(
        franchiseStep,
      ),
    "franchise.mainline": (call) => linkFranchiseGameAction(call.franchiseId, gameId, call.mainline).then(franchiseStep),
    "franchise.parent": (call) =>
      linkFranchiseGameAction(call.franchiseId, gameId, undefined, { parent_game_id: call.parentGameId }).then(franchiseStep),
    "franchise.unlink": (call) => unlinkFranchiseGameAction(call.franchiseId, gameId).then(franchiseStep),
  };
  // Sections whose saved record only the API knows (new image and release
  // ids, image URLs, a linked thread's jump link, a linked version's cover):
  // read back after a save, whether it went through or not, since a failed
  // section may have saved some of its calls.
  const reloads: { [K in GameEditSectionKey]?: () => Promise<GameEditRecord[K] | null> } = {
    images: () => listGameImagesAction(gameId),
    threads: () => loadGameThreadsAction(gameId),
    releases: () => loadReleasesAction(gameId),
    versions: () => loadVersionsAction(gameId),
    franchises: () => loadGameFranchisesAction(gameId),
  };
  const changes = gameEditSave.changes(record, stage, viewer);

  // Sets (or, with undefined, drops) one section's staged edits. Nothing
  // stages while Save all runs or into a section that can't be edited.
  function stageSection<K extends GameEditSectionKey>(key: K, staged: GameEditStage[K] | undefined) {
    if (savingRef.current || unavailable[key]) return;
    setStage((prev) => {
      const next = { ...prev };
      if (staged === undefined) delete next[key];
      else next[key] = staged;
      return next;
    });
  }

  // Puts a section's fresh record in place: after a save (see `reloads`)
  // or after a refresh or lookup a tab ran (an action, not an edit). A
  // fresh read makes an unavailable section editable again.
  function reloadSection<K extends GameEditSectionKey>(key: K, loaded: GameEditRecord[K]) {
    setRecord((prev) => ({ ...prev, [key]: loaded }));
    setUnavailable((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function discard() {
    setStage({});
    setErrors({});
    setNotice(null);
  }

  function save() {
    if (savingRef.current) return;
    savingRef.current = true;
    const clicked = stage;
    startSaving(async () => {
      try {
        const outcome = await gameEditSave.run(record, clicked, viewer, steps);
        setRecord((prev) => recordAfterSave(prev, outcome));
        setStage((prev) => stageAfterSave(prev, clicked, outcome));
        const failed = outcome.sections.filter((s) => s.status === "failed");
        setErrors(Object.fromEntries(failed.map((s) => [s.key, s.error])));
        setNotice(failed.length > 0 ? { title: saveSummary(outcome).split(":")[0], failed: failed.map((s) => s.label) } : null);
        const fresh = await Promise.all(
          outcome.sections.map(async ({ key }) => [key, reloads[key] ? await reloads[key]() : undefined] as const),
        );
        for (const [key, data] of fresh) {
          if (data) reloadSection(key, data as GameEditRecord[typeof key]);
          // Its record may hold guesses (a new Release's placeholder id), so
          // it can't be edited until the page is read again.
          else if (data === null) setUnavailable((prev) => ({ ...prev, [key]: SECTION_NOT_READ_BACK }));
        }
        router.refresh();
      } finally {
        savingRef.current = false;
      }
    });
  }

  return {
    record,
    stage,
    unavailable,
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

// A Franchise call's parent as the link action's option: absent keeps it.
function parentOption(parentGameId: number | null | undefined): { parent_game_id?: number | null } {
  return parentGameId === undefined ? {} : { parent_game_id: parentGameId };
}

function franchiseStep(result: FranchiseResult<unknown>): StepResult {
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

export type GameEdit = ReturnType<typeof useGameEdit>;

function imageForm(file: File, kind: string, primary: boolean): FormData {
  const form = new FormData();
  form.append("file", file);
  form.append("kind", kind);
  form.append("is_primary", String(primary));
  return form;
}
