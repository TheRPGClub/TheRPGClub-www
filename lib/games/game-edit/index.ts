import { createGameEditSave, type EditCall, type EditRecord, type EditStage, type EditSteps } from "./engine";
import type { Release } from "@/lib/api/types";
import { releasesSection, type ReleaseCall, type ReleasesStage } from "./releases";
import { textSection, type GameText, type GameUpdateCall, type TextStage } from "./text";

// The Game Edit save module's sections (spec api#437). To add one (Images,
// Game Threads, Releases, Alternate Versions, HowLongToBeat):
//   1. write its GameEditSection beside text.ts, with its loaded and staged
//      shapes and its call kinds;
//   2. add it to GameEditSections below and to SECTIONS / ORDER;
//   3. the compiler then asks GameEditSteps for a step per new call kind,
//      which the page fills with server actions.

export interface GameEditSections {
  text: { loaded: GameText; staged: TextStage; call: GameUpdateCall };
  releases: { loaded: Release[]; staged: ReleasesStage; call: ReleaseCall };
}

export type GameEditSectionKey = keyof GameEditSections;
export type GameEditRecord = EditRecord<GameEditSections>;
export type GameEditStage = EditStage<GameEditSections>;
export type GameEditCall = EditCall<GameEditSections>;
export type GameEditSteps = EditSteps<GameEditSections>;

export const gameEditSave = createGameEditSave<GameEditSections>(
  { text: textSection, releases: releasesSection },
  ["text", "releases"],
);

export { saveSummary, type GameEditViewer, type StepResult } from "./engine";
export type { GameText, TextStage } from "./text";
export type { ReleaseCall, ReleaseDraft, ReleaseFields, ReleasesStage } from "./releases";
