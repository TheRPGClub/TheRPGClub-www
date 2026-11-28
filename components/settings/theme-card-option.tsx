"use client";

import { Check, Loader2, Lock } from "lucide-react";
import type { ThemeCard } from "@/lib/theme-picker";
import { Badge } from "@/components/ui/badge";
import { ToggleGroupItem } from "@/components/ui/toggle-group";
import { ThemeSwatch } from "@/components/settings/theme-swatch";

// One card of the Theme picker (ticket www#250, sketch A "Cover pair"): the
// Theme's swatch as its cover, its name, "Club default" or "Staff preview",
// and a state word: "Wearing" on the Member's Theme, "Saving" while a choice
// is on its way. A stored Theme the Member may no longer choose stays chosen
// ("Yours"), greyed, with "Back when staff release it".
export function ThemeCardOption({ card, chosen, saving }: { card: ThemeCard; chosen: boolean; saving: boolean }) {
  const state = saving ? "Saving" : chosen ? (card.available ? "Wearing" : "Yours") : "";
  return (
    <ToggleGroupItem
      value={card.key}
      className="relative h-auto flex-col items-stretch justify-start gap-2.5 p-2 pb-3"
    >
      {chosen && !saving ? (
        <span
          aria-hidden
          className="absolute top-3.5 right-3.5 z-10 grid size-6 place-items-center rounded-full bg-highlight text-highlight-foreground shadow-md sm:size-[26px]"
        >
          <Check className="size-4" strokeWidth={2.5} />
        </span>
      ) : null}
      <span className={card.available ? "block" : "block brightness-75 grayscale-[.85]"}>
        <ThemeSwatch theme={card.key} />
      </span>
      <span className={`flex flex-col gap-1.5 px-1 ${saving ? "opacity-60" : ""}`}>
        <span
          className={`font-headline text-[1.1rem] leading-none sm:text-[1.35rem] ${card.available ? "" : "text-dim-foreground"}`}
        >
          {card.name}
        </span>
        <span className="flex min-h-5 flex-wrap items-center gap-1.5">
          {card.clubDefault ? (
            <Badge tone="outline" size="sm">
              Club default
            </Badge>
          ) : null}
          {card.staffPreview ? (
            <Badge tone="highlight" size="sm">
              Staff preview
            </Badge>
          ) : null}
          {state ? (
            <span
              className={`font-label inline-flex items-center gap-1.5 text-[0.8rem] leading-none tracking-[0.07em] uppercase ${saving ? "text-foreground" : "text-highlight"}`}
            >
              {saving ? <Loader2 aria-hidden className="size-3.5 animate-spin motion-reduce:animate-none" /> : null}
              {state}
            </span>
          ) : null}
        </span>
        {!card.available ? (
          <span className="flex items-center gap-1.5 text-[0.84rem] text-dim-foreground">
            <Lock aria-hidden className="size-3.5 text-faint-foreground" />
            Back when staff release it
          </span>
        ) : null}
      </span>
    </ToggleGroupItem>
  );
}
