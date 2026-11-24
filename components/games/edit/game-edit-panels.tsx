import type { GameEdit } from "@/hooks/use-game-edit";
import type { GameEditSectionKey } from "@/lib/games/game-edit";
import type { GameEditTab } from "@/lib/games/game-edit/tabs";
import type { GameEditViewProps } from "@/components/games/edit/game-edit-view";
import { HltbTab } from "@/components/games/edit/hltb-tab";
import { ImagesTab } from "@/components/games/edit/images-tab";
import { ReleasesTab } from "@/components/games/edit/releases-tab";
import { TextVideoTab } from "@/components/games/edit/text-video-tab";
import { ThreadsTab } from "@/components/games/edit/threads-tab";
import { VersionsTab } from "@/components/games/edit/versions-tab";
import { UnavailableTab } from "@/components/games/edit/unavailable-tab";
import { FranchisesTab } from "@/components/games/edit/franchises-tab";

const TITLES: Record<GameEditSectionKey, string> = {
  text: "Description & video",
  images: "Images",
  threads: "Game Threads",
  releases: "Releases",
  versions: "Alternate Versions",
  hltb: "HowLongToBeat",
  franchises: "Franchises",
};

// The Game Edit page's section a tab, each wired to the save module. A
// section that can't be edited says why; while Save all runs every section
// is locked (inert), so nothing is staged that the save would overwrite.
export function gameEditPanels(p: GameEditViewProps, edit: GameEdit): Record<GameEditTab, React.ReactNode> {
  const panels = sections(p, edit);
  return Object.fromEntries(
    (Object.keys(panels) as GameEditSectionKey[]).map((key) => {
      const why = edit.unavailable[key];
      const panel = why ? (
        <UnavailableTab title={TITLES[key]} message={why} />
      ) : (
        <div inert={edit.saving} aria-busy={edit.saving}>
          {panels[key]}
        </div>
      );
      return [key, panel];
    }),
  ) as Record<GameEditTab, React.ReactNode>;
}

function sections(p: GameEditViewProps, edit: GameEdit): Record<GameEditSectionKey, React.ReactNode> {
  return {
    text: (
      <TextVideoTab
        loaded={edit.record.text}
        staged={edit.stage.text}
        error={edit.errors.text}
        onStage={(next) => edit.stageSection("text", next)}
      />
    ),
    images: (
      <ImagesTab
        gameId={p.gameId}
        loaded={edit.record.images}
        staged={edit.stage.images}
        error={edit.errors.images}
        onStage={(next) => edit.stageSection("images", next)}
        onReload={(images) => edit.reloadSection("images", images)}
      />
    ),
    threads: (
      <ThreadsTab
        gameId={p.gameId}
        loaded={edit.record.threads}
        staged={edit.stage.threads}
        error={edit.errors.threads}
        onStage={(next) => edit.stageSection("threads", next)}
      />
    ),
    releases: (
      <ReleasesTab
        gameId={p.gameId}
        loaded={edit.record.releases}
        staged={edit.stage.releases}
        error={edit.errors.releases}
        options={p.releaseOptions}
        canRefresh={p.canRefreshReleases}
        onStage={(next) => edit.stageSection("releases", next)}
        onReload={(releases) => edit.reloadSection("releases", releases)}
      />
    ),
    versions: (
      <VersionsTab
        gameId={p.gameId}
        loaded={edit.record.versions}
        staged={edit.stage.versions}
        error={edit.errors.versions}
        onStage={(next) => edit.stageSection("versions", next)}
      />
    ),
    hltb: (
      <HltbTab
        gameId={p.gameId}
        loaded={edit.record.hltb}
        staged={edit.stage.hltb}
        error={edit.errors.hltb}
        onStage={(next) => edit.stageSection("hltb", next)}
        onReload={(hltb) => edit.reloadSection("hltb", hltb)}
      />
    ),
    franchises: (
      <FranchisesTab
        loaded={edit.record.franchises}
        staged={edit.stage.franchises}
        error={edit.errors.franchises}
        series={p.series}
        onStage={(next) => edit.stageSection("franchises", next)}
      />
    ),
  };
}
