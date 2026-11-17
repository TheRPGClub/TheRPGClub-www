"use client";

import { useState, useTransition } from "react";
import { startRunAction } from "@/app/actions/challenge-runs";
import { Button } from "@/components/ui/button";

// Start a Run on a flyer or billboard (surface brief challenges-index): the
// yellow call to action, laid above the card's stretched link. A refusal is
// pinned under it as a small paper slip in the API's own words.
export function StartRunButton({ challengeId, again = false }: { challengeId: number; again?: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const start = () =>
    startTransition(async () => {
      setError(null);
      const result = await startRunAction(challengeId);
      if (!result.ok) setError(result.error ?? "That didn't work.");
    });
  return (
    <div className="relative z-10 flex flex-col items-start gap-2.5">
      <Button type="button" variant="highlight" size="sm" disabled={pending} onClick={start}>
        {pending ? "Starting…" : again ? "Start a new Run" : "Start a Run"}
      </Button>
      {error && (
        <p
          role="alert"
          className="max-w-[34ch] -rotate-1 rounded-xs bg-foreground px-3 py-2 text-[0.85rem] leading-[1.4] text-background shadow-[0_8px_18px_rgb(0_0_0/0.45)]"
        >
          {error}
        </p>
      )}
    </div>
  );
}
