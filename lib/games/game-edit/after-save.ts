import type { EditOutcome } from "./engine";
import type { GameEditRecord, GameEditSectionKey, GameEditSections, GameEditStage } from "./index";

// Folding a Save all's outcome back into the page's state (spec api#437).
// The save runs async, so the page may have moved on by the time it ends: a
// section staged again after the click keeps what the editor did since, and
// a section the save didn't touch keeps whatever it holds now.

export type GameEditOutcome = EditOutcome<GameEditSections>;

// Why a section can't be edited, by section.
export type GameEditUnavailable = Partial<Record<GameEditSectionKey, string>>;

export const SECTION_UNREADABLE = "This section couldn't be loaded, so it can't be edited. Refresh the page to try again.";
export const SECTION_NOT_READ_BACK =
  "Changes here were saved, but the section couldn't be read back. Refresh the page to see them and keep editing.";

// The stage after a save: each saved or failed section takes the outcome's
// (nothing, or a failed section's remaining edits), unless it was staged
// again since `clicked`, the stage Save all ran with.
export function stageAfterSave(current: GameEditStage, clicked: GameEditStage, outcome: GameEditOutcome): GameEditStage {
  const next: GameEditStage = { ...current };
  for (const { key } of outcome.sections) {
    if (current[key] !== clicked[key]) continue;
    const kept = outcome.staged[key];
    if (kept === undefined) delete next[key];
    else (next as Record<string, unknown>)[key] = kept;
  }
  return next;
}

// The record after a save: the saved sections' records from the outcome,
// every other section as it is now.
export function recordAfterSave(current: GameEditRecord, outcome: GameEditOutcome): GameEditRecord {
  const next = { ...current };
  for (const { key, status } of outcome.sections) {
    if (status === "saved") (next as Record<string, unknown>)[key] = outcome.record[key];
  }
  return next;
}

// Sections that can't be edited drop out of the stage, so they neither
// count nor save.
export function withoutUnavailable(stage: GameEditStage, unavailable: GameEditUnavailable): GameEditStage {
  const next = { ...stage };
  for (const key of Object.keys(unavailable) as GameEditSectionKey[]) delete next[key];
  return next;
}
