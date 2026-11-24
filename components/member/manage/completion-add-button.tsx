"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { memberGameShelfAction } from "@/app/actions/member-game-shelf";
import type { Game, GameCompletion, UserNowPlaying } from "@/lib/api/types";
import { CompletionDialog } from "@/components/member/shelf-forms/completion-dialog";
import { AddBySearch } from "./add-by-search";
import { useShelfManageContext } from "./shelf-manage-context";

interface Logging {
  game: Game;
  completions: GameCompletion[];
  nowPlaying: UserNowPlaying | null;
}

// "Log a completion" on the owner's Completed page (spec api#451, pick 3A):
// search for a game, then the Game Completion dialog with the member's
// earlier completions of it on the timeline and Started from their Now
// Playing entry.
export function CompletionAddButton() {
  const { owner, listName, manage } = useShelfManageContext();
  const [logging, setLogging] = useState<Logging | null>(null);

  const pick = async (game: Game) => {
    const found = await memberGameShelfAction(owner.userId, game.game_id).catch(
      () => null,
    );
    setLogging({
      game,
      completions: found?.completions ?? [],
      nowPlaying: found?.nowPlaying ?? null,
    });
  };

  return (
    <>
      <AddBySearch
        label="Log a completion"
        shortLabel="Log"
        icon={Flag}
        listLabel={listName}
        igdbBlockedReason={owner.igdbBlockedReason}
        onPick={pick}
      />
      {logging && (
        <CompletionDialog
          open
          onOpenChange={(open) => !open && setLogging(null)}
          userId={owner.userId}
          game={logging.game}
          completions={logging.completions}
          nowPlaying={logging.nowPlaying}
          platforms={owner.platforms}
          onSaved={(saved) => {
            setLogging(null);
            manage.saved(saved);
          }}
        />
      )}
    </>
  );
}
