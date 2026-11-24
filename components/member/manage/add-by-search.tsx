"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import type { Game } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { GamePicker } from "@/components/member/game-picker";

// The owner's yellow add button beside a list page's title (spec api#451,
// pick 3A): it opens a game search, and picking a game hands it to the
// list's form.
export function AddBySearch({
  label,
  shortLabel,
  icon: Icon,
  listLabel,
  igdbBlockedReason,
  onPick,
}: {
  label: string;
  // The phone's shorter label ("Log").
  shortLabel?: string;
  icon: LucideIcon;
  // The list, as the IGDB offer names it.
  listLabel: string;
  igdbBlockedReason: string | null;
  onPick: (game: Game) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button type="button" variant="highlight" />}>
        <Icon data-icon="inline-start" aria-hidden />
        {shortLabel ? (
          <>
            <span className="sm:hidden">{shortLabel}</span>
            <span className="max-sm:hidden">{label}</span>
          </>
        ) : (
          label
        )}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[min(26rem,calc(100vw-2rem))] gap-2.5 p-3"
      >
        <PopoverTitle className="px-0.5">{label}</PopoverTitle>
        {open && (
          <GamePicker
            compact
            autoFocus
            placeholder="Search for a game…"
            igdbFallback={{ listLabel, blockedReason: igdbBlockedReason }}
            onPick={(game) => {
              setOpen(false);
              onPick(game);
            }}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}
