"use client";

import { useState } from "react";
import { useStartRun } from "@/hooks/use-start-run";
import { Button } from "@/components/ui/button";
import { BirthDatePrompt } from "@/components/challenges/birth-date-prompt";

// Start a Run on a flyer or billboard (surface brief challenges-index): the
// yellow call to action, laid above the card's stretched link. A refusal is
// pinned under it as a small paper slip in the API's own words, as is a new
// Run's notice; a birth-year Slots Run asks for the Birth Date first.
export function StartRunButton({ challengeId, again = false }: { challengeId: number; again?: boolean }) {
  const [slip, setSlip] = useState<string | null>(null);
  const run = useStartRun(challengeId, {
    onRefused: setSlip,
    onStarted: (notices) => notices.length > 0 && setSlip(notices.map((n) => n.message).join(" ")),
  });
  const pending = run.pending;
  const start = () => {
    setSlip(null);
    run.start();
  };
  return (
    <div className="relative z-10 flex flex-col items-start gap-2.5">
      <Button type="button" variant="highlight" size="sm" disabled={pending} onClick={start}>
        {pending ? "Starting…" : again ? "Start a new Run" : "Start a Run"}
      </Button>
      {slip && (
        <p
          role="alert"
          data-slot="run-slip"
          className="max-w-[34ch] rounded-xs bg-foreground px-3 py-2 text-[0.85rem] leading-[1.4] text-background"
        >
          {slip}
        </p>
      )}
      <BirthDatePrompt prompt={run.birthPrompt} pending={pending} />
    </div>
  );
}
