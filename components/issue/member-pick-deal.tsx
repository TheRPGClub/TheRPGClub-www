"use client";

import { useState } from "react";
import { Shuffle } from "lucide-react";
import type { BacklogPick, Platform } from "@/lib/api/types";
import { DealCard } from "@/components/issue/member-pick-deal-card";
import { KeptBar } from "@/components/issue/member-pick-deal-kept";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Deal three, pick one: the picker's draws laid out face up as a hand of
// cards, HowLongToBeat times side by side. The member keeps one (the first
// draw starts kept) and starts playing it from the bar underneath; dealing
// again redraws the whole hand.

// On screen the first draw sits in the middle of the hand, raised; the
// reading order stays first, second, third.
const SEAT = [
  "sm:col-start-2 sm:z-10",
  "sm:col-start-1 sm:rotate-[-4deg] sm:translate-y-3.5",
  "sm:col-start-3 sm:rotate-[4deg] sm:translate-y-3.5",
];

export function PickDeal({
  userId,
  picks,
  platforms,
  redealHref,
}: {
  userId: string;
  picks: BacklogPick[];
  // Only loaded when a draw has no platform: the member chooses one first.
  platforms?: Platform[];
  redealHref: string;
}) {
  const [kept, setKept] = useState(0);
  const keptPick = picks[kept] ?? picks[0];

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-border bg-[radial-gradient(ellipse_at_50%_40%,var(--color-muted)_0%,var(--color-background)_70%)] px-0 py-4 max-sm:border-0 max-sm:bg-none sm:px-5 sm:pt-10 sm:pb-8">
        <ol
          aria-label="Your hand"
          className={cn(
            "grid gap-3.5 sm:mx-auto sm:items-end sm:gap-6.5",
            picks.length === 3 && "sm:max-w-[60rem] sm:grid-cols-3",
            picks.length === 2 && "sm:max-w-[40rem] sm:grid-cols-2",
            picks.length === 1 && "sm:max-w-[20rem]",
          )}
        >
          {picks.map((pick, i) => (
            <DealCard
              key={pick.entry_id}
              pick={pick}
              on={i === kept}
              seat={picks.length === 3 ? SEAT[i] : ""}
              onKeep={() => setKept(i)}
            />
          ))}
        </ol>

        <div className="mt-6 flex justify-center sm:mt-9">
          <ButtonLink href={redealHref} variant="outline">
            <Shuffle data-icon="inline-start" />
            Deal again
          </ButtonLink>
        </div>
      </div>

      {keptPick && (
        <KeptBar userId={userId} keptPick={keptPick} platforms={platforms} />
      )}
    </div>
  );
}
