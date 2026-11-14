"use client";

import { useState, useTransition } from "react";
import { LoaderCircle, Unlink } from "lucide-react";
import { unlinkThreadAction } from "@/app/actions/game-links";
import { Button } from "@/components/ui/button";

// Unlinks one of the game's Discord threads (Regulars, or Moderator and up).
// The action revalidates the page, so the rail's list updates.
export function UnlinkThreadButton({
  threadId,
  threadName,
  gameId,
}: {
  threadId: string;
  threadName: string;
  gameId: number;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function unlink() {
    setError(null);
    startTransition(async () => {
      const result = await unlinkThreadAction(threadId, gameId);
      if (!result.ok) setError(result.error ?? "Couldn't unlink that thread.");
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label={`Unlink ${threadName}`}
        title="Unlink from this game"
        disabled={pending}
        onClick={unlink}
      >
        {pending ? <LoaderCircle className="motion-safe:animate-spin" /> : <Unlink />}
      </Button>
      {error && (
        <p role="alert" className="col-span-2 text-xs text-destructive">
          {error}
        </p>
      )}
    </>
  );
}
