import { createGameEditSave, type EditCall, type EditRecord, type EditStage, type EditSteps } from "./engine";
import { textSection, type GameText, type GameUpdateCall, type TextStage } from "./text";
import { threadsSection, type GameThreadRef, type ThreadCall, type ThreadsStage } from "./threads";
import { versionsSection, type AlternateVersion, type VersionCall, type VersionsStage } from "./versions";

// The Game Edit save module's sections (spec api#437). To add one (Images,
// Game Threads, Releases, Alternate Versions, HowLongToBeat):
//   1. write its GameEditSection beside text.ts, with its loaded and staged
//      shapes and its call kinds;
//   2. add it to GameEditSections below and to SECTIONS / ORDER;
//   3. the compiler then asks GameEditSteps for a step per new call kind,
//      which the page fills with server actions.

export interface GameEditSections {
  text: { loaded: GameText; staged: TextStage; call: GameUpdateCall };
  threads: { loaded: GameThreadRef[]; staged: ThreadsStage; call: ThreadCall };
  versions: { loaded: AlternateVersion[]; staged: VersionsStage; call: VersionCall };
}

export type GameEditSectionKey = keyof GameEditSections;
export type GameEditRecord = EditRecord<GameEditSections>;
export type GameEditStage = EditStage<GameEditSections>;
export type GameEditCall = EditCall<GameEditSections>;
export type GameEditSteps = EditSteps<GameEditSections>;

export const gameEditSave = createGameEditSave<GameEditSections>(
  { text: textSection, threads: threadsSection, versions: versionsSection },
  ["text", "threads", "versions"],
);

export { saveSummary, type GameEditViewer, type StepResult } from "./engine";
export type { GameText, TextStage } from "./text";
export type { GameThreadRef, ThreadRef, ThreadsStage } from "./threads";
export { alternateVersion, type AlternateVersion, type VersionsStage } from "./versions";
