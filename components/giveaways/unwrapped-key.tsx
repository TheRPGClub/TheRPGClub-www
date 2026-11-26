"use client";

import { ArrowLeft } from "lucide-react";
import type { GameKey } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { GiftLetter } from "@/components/giveaways/claimed/gift-letter";

// Just claimed: the present unwraps in place into the letter with the key
// (shown at once) and the bot's DM status, with the way back to the shelf.
export function UnwrappedKey({
  gameKey,
  jobId,
  donorName,
  viewerName,
  onBack,
}: {
  gameKey: GameKey;
  jobId: number | null;
  donorName: string;
  viewerName: string;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end gap-x-5 gap-y-3 border-b-2 border-foreground pb-3">
        <h1 className="font-headline text-5xl sm:text-6xl">Unwrapped</h1>
        <p className="font-label pb-1 text-sm text-faint-foreground">Claimed just now</p>
        <Button type="button" variant="outline" onClick={onBack} className="ml-auto mb-1">
          <ArrowLeft data-icon="inline-start" />
          Back to the shelf
        </Button>
      </header>
      <div className="max-w-5xl">
        <GiftLetter gameKey={gameKey} donorName={donorName} viewerName={viewerName} jobId={jobId} justClaimed />
      </div>
    </div>
  );
}
