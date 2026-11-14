"use client";

import { useState, useTransition } from "react";
import { CircleCheck, Link2, LoaderCircle } from "lucide-react";
import { linkVersionAction } from "@/app/actions/game-links";
import type { Game } from "@/lib/api/types";
import { versionPickProblem } from "@/lib/game-links";
import { Button } from "@/components/ui/button";
import { GamePicker } from "@/components/member/game-picker";

// "Link a version" under the game page's Alternate versions (Admins): pick
// another GameDB game, then link it. The action revalidates both pages, so the
// new version shows in the list above.
export function LinkVersionForm({
  gameId,
  alternateIds,
}: {
  gameId: number;
  alternateIds: number[];
}) {
  const [picked, setPicked] = useState<Game | null>(null);
  // Remounts the picker to clear it after a link.
  const [pickerKey, setPickerKey] = useState(0);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [linked, setLinked] = useState<string | null>(null);

  const problem = picked
    ? versionPickProblem(picked.game_id, gameId, alternateIds)
    : null;

  function link() {
    if (!picked || problem) return;
    const game = picked;
    setError(null);
    setLinked(null);
    startTransition(async () => {
      const result = await linkVersionAction(gameId, game.game_id);
      if (!result.ok) {
        setError(result.error ?? "Couldn't link that version.");
        return;
      }
      setLinked(game.title);
      setPicked(null);
      setPickerKey((k) => k + 1);
    });
  }

  return (
    <div className="mt-4 max-w-xl rounded-sm border border-dashed border-border-strong p-3.5">
      <p className="font-label mb-2 text-[0.8rem] font-extrabold tracking-[0.08em] text-faint-foreground">
        Link a version
        <span className="ml-2 font-normal tracking-normal">Admin</span>
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <GamePicker
          key={pickerKey}
          compact
          className="min-w-0 flex-1"
          placeholder="Search for the other version…"
          onPick={(game) => {
            setPicked(game);
            setError(null);
            setLinked(null);
          }}
        />
        <Button
          type="button"
          className="self-start"
          disabled={!picked || !!problem || pending}
          onClick={link}
        >
          {pending ? (
            <LoaderCircle data-icon="inline-start" className="animate-spin" />
          ) : (
            <Link2 data-icon="inline-start" />
          )}
          Link version
        </Button>
      </div>
      <div aria-live="polite" className="mt-2 empty:mt-0">
        {problem ? (
          <p className="text-sm text-faint-foreground">{problem}</p>
        ) : error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : linked ? (
          <p className="flex items-center gap-2 text-sm text-dim-foreground">
            <CircleCheck aria-hidden className="size-4 shrink-0 text-rarity-uncommon" />
            Linked <b className="font-semibold text-foreground">{linked}</b> as a version.
          </p>
        ) : null}
      </div>
    </div>
  );
}
