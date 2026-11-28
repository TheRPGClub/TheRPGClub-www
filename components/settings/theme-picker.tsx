"use client";

import { useState, useTransition } from "react";
import { chooseThemeAction } from "@/app/actions/member-theme";
import type { ThemeCard } from "@/lib/theme-picker";
import { RadioGroup } from "@/components/ui/radio-group";
import { SectionHeading } from "@/components/templates/page-header";
import { ThemeCardOption } from "@/components/settings/theme-card-option";

// The top row of Settings → Your look & layout (spec api#523 item 8, ticket
// www#250, sketch A "Cover pair"): one card per Theme the Member may wear,
// a radio group (arrow keys move and choose). Choosing one saves it through
// PUT /me/theme; the action refreshes, so the page re-renders in the new
// Theme. While it saves the Member's Theme stays checked and the picked card
// says "Saving"; a refusal leaves it as it was and shows the action's sentence.
export function ThemePicker({ cards }: { cards: ThemeCard[] }) {
  const stored = cards.find((card) => card.chosen)?.key ?? cards[0]?.key;
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const saving = isPending ? pending : null;

  const choose = (key: string) => {
    if (key === stored || isPending) return;
    setPending(key);
    setError(null);
    startTransition(async () => {
      const result = await chooseThemeAction(key).catch(() => ({
        ok: false,
        error: "Your Theme wasn't saved. Try again.",
      }));
      if (!result.ok) setError(result.error ?? "Your Theme wasn't saved. Try again.");
      setPending(null);
    });
  };

  return (
    <section aria-labelledby="settings-theme" className="flex max-w-2xl flex-col">
      <SectionHeading title={<span id="settings-theme">Your Theme</span>} count={`${cards.length} Themes`} />
      <p className="mt-3 max-w-[60ch] text-dim-foreground">How the whole site looks to you. Only you see it.</p>
      <RadioGroup
        value={stored}
        onValueChange={(next) => choose(String(next))}
        aria-label="Theme"
        aria-busy={isPending}
        className="mt-4 max-w-xl grid-cols-2 gap-3 sm:gap-5"
      >
        {cards.map((card) => (
          <ThemeCardOption key={card.key} card={card} chosen={card.key === stored} saving={card.key === saving} />
        ))}
      </RadioGroup>
      {error ? (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </section>
  );
}
