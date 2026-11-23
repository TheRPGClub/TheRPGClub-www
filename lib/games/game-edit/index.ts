import { createGameEditSave, type EditCall, type EditRecord, type EditStage, type EditSteps } from "./engine";
import type { Release } from "@/lib/api/types";
import { releasesSection, type ReleaseCall, type ReleasesStage } from "./releases";
import { textSection, type GameText, type GameUpdateCall, type TextStage } from "./text";
import { imagesSection, type GameImageEntry, type ImageCall, type ImagesStage } from "./images";
import { threadsSection, type GameThreadRef, type ThreadCall, type ThreadsStage } from "./threads";
import { versionsSection, type AlternateVersion, type VersionCall, type VersionsStage } from "./versions";
import { hltbSection, type HltbStage, type HltbTimes, type HltbUpsertCall } from "./hltb";

// The Game Edit save module's sections (spec api#437). To add one (Images,
// Game Threads, Releases, Alternate Versions, HowLongToBeat):
//   1. write its GameEditSection beside text.ts, with its loaded and staged
//      shapes and its call kinds;
//   2. add it to GameEditSections below and to SECTIONS / ORDER;
//   3. the compiler then asks GameEditSteps for a step per new call kind,
//      which the page fills with server actions.

export interface GameEditSections {
  text: { loaded: GameText; staged: TextStage; call: GameUpdateCall };
  images: { loaded: GameImageEntry[]; staged: ImagesStage; call: ImageCall };
  threads: { loaded: GameThreadRef[]; staged: ThreadsStage; call: ThreadCall };
  releases: { loaded: Release[]; staged: ReleasesStage; call: ReleaseCall };
  versions: { loaded: AlternateVersion[]; staged: VersionsStage; call: VersionCall };
  hltb: { loaded: HltbTimes; staged: HltbStage; call: HltbUpsertCall };
}

export type GameEditSectionKey = keyof GameEditSections;
export type GameEditRecord = EditRecord<GameEditSections>;
export type GameEditStage = EditStage<GameEditSections>;
export type GameEditCall = EditCall<GameEditSections>;
export type GameEditSteps = EditSteps<GameEditSections>;

export const gameEditSave = createGameEditSave<GameEditSections>(
  {
    text: textSection,
    images: imagesSection,
    threads: threadsSection,
    releases: releasesSection,
    versions: versionsSection,
    hltb: hltbSection,
  },
  ["text", "images", "threads", "releases", "versions", "hltb"],
);

export { saveSummary, type GameEditViewer, type StepResult } from "./engine";
export type { GameText, TextStage } from "./text";
export type { GameImageEntry, ImageCall, ImagesStage, ImageKind, PendingImage } from "./images";
export type { GameThreadRef, ThreadRef, ThreadsStage } from "./threads";
export type { ReleaseCall, ReleaseDraft, ReleaseFields, ReleasesStage } from "./releases";
export { alternateVersion, type AlternateVersion, type VersionsStage } from "./versions";
export { hltbFieldValue, type HltbField, type HltbStage, type HltbTimes, type HltbUpsertFields } from "./hltb";
export {
  recordAfterSave,
  SECTION_NOT_READ_BACK,
  SECTION_UNREADABLE,
  stageAfterSave,
  withoutUnavailable,
  type GameEditUnavailable,
} from "./after-save";
