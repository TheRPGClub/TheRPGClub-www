"use client";

import { useActionState } from "react";
import { Play } from "lucide-react";
import { startPlayingFromPickAction } from "@/app/actions/backlog-pick";
import type { ActionResult } from "@/app/actions/game-lists";
import type { Platform } from "@/lib/api/types";
import { Button } from "@/components/ui/button";

const initialState: ActionResult<null> = { ok: true, data: null };

interface StartPlayingFormProps {
  userId: string;
  gamedbGameId: number;
  platformId: number | null;
  // Only passed when the pick has no platform: the member chooses one first.
  platforms?: Platform[];
}

export function StartPlayingForm({
  userId,
  gamedbGameId,
  platformId,
  platforms,
}: StartPlayingFormProps) {
  const [state, formAction, pending] = useActionState(
    startPlayingFromPickAction.bind(null, userId, {
      gamedb_game_id: gamedbGameId,
      platform_id: platformId,
    }),
    initialState,
  );
  const needsPlatform = platformId === null;

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      {needsPlatform && (
        <select
          name="platform_id"
          required
          defaultValue=""
          aria-label="Platform"
          className="h-8 max-w-56 rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="" disabled>
            Playing it on…
          </option>
          {(platforms ?? []).map((p) => (
            <option key={p.platform_id} value={p.platform_id}>
              {p.platform_name}
            </option>
          ))}
        </select>
      )}
      <Button type="submit" disabled={pending}>
        <Play />
        {pending ? "Starting…" : "Start playing"}
      </Button>
      {!state.ok && state.error && (
        <p role="alert" className="w-full text-sm text-destructive">
          {state.error}
        </p>
      )}
    </form>
  );
}
