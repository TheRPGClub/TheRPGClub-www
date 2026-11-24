"use client";

import { useId } from "react";
import { useCompletionLog } from "@/hooks/use-completion-log";
import type { ShelfSaved } from "@/hooks/use-shelf-save";
import type { GameCompletion, Platform } from "@/lib/api/types";
import { clubToday } from "@/lib/shelf-forms/dates";
import { CompletionForm } from "@/components/member/shelf-forms/completion-form";

// A Game Completion's form inside the Completed page's spotlight (spec
// api#451, pick 3A): the shared paper slip in place of the facts, over the
// game's key art. Esc cancels.
export function SpotlightCompletionEditor({
  userId,
  entry,
  platforms,
  onSaved,
  onCancel,
  onRemove,
}: {
  userId: string;
  entry: GameCompletion;
  platforms: Platform[];
  onSaved: (saved: ShelfSaved) => void;
  onCancel: () => void;
  onRemove: () => void;
}) {
  const titleId = useId();
  const today = clubToday();
  const log = useCompletionLog({
    userId,
    gameId: entry.gamedb_game_id,
    entry,
    today,
    onSaved,
  });
  const title = entry.game?.title ?? "Unknown game";
  return (
    <div
      className="min-w-0 max-w-[34rem]"
      onKeyDown={(event) => event.key === "Escape" && onCancel()}
    >
      <p className="font-headline mb-3 max-w-[18ch] text-[2.1rem] leading-[0.9] text-balance sm:text-[3.1rem]">
        {title}
      </p>
      <CompletionForm
        log={log}
        titleId={titleId}
        title="Edit completion"
        platforms={platforms}
        today={today}
        onCancel={onCancel}
        onRemove={onRemove}
        className="sm:-rotate-[0.6deg] sm:shadow-[0_24px_60px_rgb(0_0_0/0.6)]"
      />
    </div>
  );
}
