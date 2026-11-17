"use client";

import { useState, useTransition } from "react";
import { startRunAction } from "@/app/actions/challenge-runs";
import type { RunNotice } from "@/lib/challenges/slot-requests";

// Starting the signed-in member's Run of a Challenge, wherever its button
// sits (a flyer, the Challenge page, a Slots Run panel). A birth-year Slots
// Run without a Birth Date isn't an error to show: it opens the Birth Date
// prompt (with the API's own words), and saving the date starts the Run.
// Any other refusal goes to `onRefused`; a started Run's notices (the birth
// year shows) to `onStarted`.
export function useStartRun(
  challengeId: number,
  { onRefused, onStarted }: { onRefused: (error: string) => void; onStarted?: (notices: RunNotice[]) => void },
) {
  const [pending, startTransition] = useTransition();
  const [askBirthDate, setAskBirthDate] = useState<string | null>(null);

  const start = () =>
    startTransition(async () => {
      const result = await startRunAction(challengeId);
      if (result.ok) {
        setAskBirthDate(null);
        onStarted?.(result.notices ?? []);
      } else if (result.code === "birth_date_required") {
        setAskBirthDate(result.error ?? "This Run starts at your birth year.");
      } else {
        onRefused(result.error ?? "That didn't work.");
      }
    });

  return {
    pending,
    start,
    birthPrompt: {
      // The API's refusal, saying why the date is needed; null while closed.
      message: askBirthDate,
      close: () => setAskBirthDate(null),
      // The date is saved: start the Run again.
      onSaved: start,
    },
  };
}

export type BirthPrompt = ReturnType<typeof useStartRun>["birthPrompt"];
