"use client";

import { useState } from "react";
import type { ChallengeFormState } from "@/hooks/use-challenge-form";
import type { PoolSide } from "@/lib/challenges/pool-editor";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { GamePicker } from "@/components/member/game-picker";

// The search above both sections (pick 8): a GameDB search whose pick joins
// the Pool as a Core or an Optional Game, as chosen beside it (Optional by
// default, since only a person makes a game Core). A game already in the
// Pool moves; a Left out one comes back.
export function PoolSearch({ form }: { form: ChallengeFormState }) {
  const [side, setSide] = useState<PoolSide>("optional");
  // A new picker after each pick, so the field is empty for the next game.
  const [round, setRound] = useState(0);
  return (
    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-start">
      <GamePicker
        key={round}
        compact
        placeholder="Add a game to the Pool…"
        className="min-w-0 flex-1"
        onPick={(game) => {
          form.moveGame({ game_id: game.game_id, title: game.title, cover_url: game.cover_url }, side);
          setRound((r) => r + 1);
        }}
      />
      <div className="flex items-center gap-2">
        <span className="font-label text-[0.8rem] tracking-[0.08em] whitespace-nowrap text-dim-foreground">Add as</span>
        <ToggleGroup
          variant="outline"
          spacing={0}
          value={[side]}
          onValueChange={(value) => {
            const next = value[0];
            if (next === "core" || next === "optional") setSide(next);
          }}
          aria-label="Add as"
        >
          <ToggleGroupItem value="core" className="h-9 px-3.5">
            Core
          </ToggleGroupItem>
          <ToggleGroupItem value="optional" className="h-9 px-3.5">
            Optional
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}
