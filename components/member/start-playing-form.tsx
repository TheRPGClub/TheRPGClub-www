"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Play } from "lucide-react";
import {
  startPlayingFromPickAction,
  type StartPlayingResult,
} from "@/app/actions/backlog-pick";
import type { Platform } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { MemberField, MemberSelect } from "@/components/issue/member-field";

const initialState: StartPlayingResult = { ok: true, data: null };

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
    <form action={formAction} className="flex flex-wrap items-end gap-2.5">
      {needsPlatform && (
        <MemberField label="Play on" className="w-full max-w-60">
          <MemberSelect name="platform_id" required defaultValue="">
            <option value="" disabled>
              Playing it on…
            </option>
            {(platforms ?? []).map((p) => (
              <option key={p.platform_id} value={p.platform_id}>
                {p.platform_name}
              </option>
            ))}
          </MemberSelect>
        </MemberField>
      )}
      <Button type="submit" variant="highlight" disabled={pending}>
        <Play data-icon="inline-start" />
        {pending ? "Starting…" : "Start playing"}
      </Button>
      {!state.ok && state.error && (
        <p role="alert" className="w-full text-sm text-destructive">
          {state.error}
          {state.code === "already_playing" && (
            <>
              {" "}
              <Link
                href={`/members/${userId}/now-playing-games`}
                className="underline underline-offset-4 hover:text-paper"
              >
                See Now Playing
              </Link>
            </>
          )}
        </p>
      )}
    </form>
  );
}
