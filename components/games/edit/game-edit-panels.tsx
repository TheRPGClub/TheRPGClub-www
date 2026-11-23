import type { GameEdit } from "@/hooks/use-game-edit";
import type { GameEditTab } from "@/lib/games/game-edit/tabs";
import { PlaceholderTab } from "@/components/games/edit/placeholder-tab";
import { TextVideoTab } from "@/components/games/edit/text-video-tab";
import { ThreadsTab } from "@/components/games/edit/threads-tab";
import { VersionsTab } from "@/components/games/edit/versions-tab";

// The Game Edit page's section a tab, each wired to the save module.
export function gameEditPanels(gameId: number, edit: GameEdit): Record<GameEditTab, React.ReactNode> {
  return {
    text: (
      <TextVideoTab
        loaded={edit.record.text}
        staged={edit.stage.text}
        error={edit.errors.text}
        onStage={(next) => edit.stageSection("text", next)}
      />
    ),
    images: <PlaceholderTab title="Images" />,
    threads: (
      <ThreadsTab
        gameId={gameId}
        loaded={edit.record.threads}
        staged={edit.stage.threads}
        error={edit.errors.threads}
        onStage={(next) => edit.stageSection("threads", next)}
      />
    ),
    releases: <PlaceholderTab title="Releases" />,
    versions: (
      <VersionsTab
        gameId={gameId}
        loaded={edit.record.versions}
        staged={edit.stage.versions}
        error={edit.errors.versions}
        onStage={(next) => edit.stageSection("versions", next)}
      />
    ),
    hltb: <PlaceholderTab title="HowLongToBeat" />,
  };
}
