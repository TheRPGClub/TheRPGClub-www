"use client";

import { useState } from "react";
import { alternateVersion, type AlternateVersion, type VersionsStage } from "@/lib/games/game-edit";
import { versionPickProblem } from "@/lib/game-links";
import { GamePicker } from "@/components/member/game-picker";
import { EditSection } from "@/components/games/edit/edit-section";
import { VersionRow } from "@/components/games/edit/version-row";

const EMPTY: VersionsStage = { link: [], unlink: [] };

// The Versions tab (spec api#437, design www#156 round 3): the game's linked
// Alternate Versions, and a GameDB search that stages another game to link.
// Unlink stages too; Save all sends both.
export function VersionsTab({
  gameId,
  loaded,
  staged,
  error,
  onStage,
}: {
  gameId: number;
  loaded: AlternateVersion[];
  staged: VersionsStage | undefined;
  error?: string;
  onStage: (next: VersionsStage | undefined) => void;
}) {
  const stage = staged ?? EMPTY;
  const [problem, setProblem] = useState<string | null>(null);
  // Remounts the picker to clear it after a pick.
  const [pickerKey, setPickerKey] = useState(0);

  const set = (next: VersionsStage) => onStage(next.link.length + next.unlink.length > 0 ? next : undefined);
  const taken = [...loaded, ...stage.link].map((v) => v.game_id);

  return (
    <EditSection
      title="Alternate Versions"
      error={error}
      actions={
        <div className="w-full sm:w-80">
          <GamePicker
            key={pickerKey}
            compact
            placeholder="Link a GameDB game"
            onPick={(game) => {
              const why = versionPickProblem(game.game_id, gameId, taken);
              setProblem(why);
              setPickerKey((k) => k + 1);
              if (!why) set({ ...stage, link: [...stage.link, alternateVersion(game)] });
            }}
          />
          {problem && (
            <p role="status" className="mt-1.5 text-sm text-faint-foreground">
              {problem}
            </p>
          )}
        </div>
      }
    >
      {loaded.length + stage.link.length === 0 ? (
        <p className="text-sm text-faint-foreground">No other version of this game is linked yet.</p>
      ) : (
        <ul>
          {loaded.map((v) => (
            <VersionRow
              key={v.game_id}
              version={v}
              state={stage.unlink.includes(v.game_id) ? "unlinking" : "linked"}
              onUnlink={() => set({ ...stage, unlink: [...stage.unlink, v.game_id] })}
              onUndo={() => set({ ...stage, unlink: stage.unlink.filter((id) => id !== v.game_id) })}
            />
          ))}
          {stage.link.map((v) => (
            <VersionRow
              key={v.game_id}
              version={v}
              state="added"
              onUnlink={() => {}}
              onUndo={() => set({ ...stage, link: stage.link.filter((l) => l.game_id !== v.game_id) })}
            />
          ))}
        </ul>
      )}
    </EditSection>
  );
}
