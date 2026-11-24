"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban, Check, ListPlus, Lock, Plus, X } from "lucide-react";
import { addGameToListAction, removeGameFromListAction } from "@/app/actions/game-lists";
import type { OwnListChoice } from "@/lib/game-lists/game-cards";
import { Button, ButtonLink } from "@/components/ui/button";

// Add to list, opened inline above the game's list cards (pick 5C): one
// toggle per list of the viewer's. A list the game is on is filled paper
// with its place; tapping it takes the game out. One just added is yellow;
// a full list is greyed. A dashed New list starts one with the game picked.
// Ringed in yellow: it's the member's own business.
export function AddToListTray({ gameId, gameTitle, own, onClose }: { gameId: number; gameTitle: string; own: OwnListChoice[]; onClose: () => void }) {
  const router = useRouter();
  const [choices, setChoices] = useState(own);
  const [just, setJust] = useState<number | null>(null);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [pending, startTransition] = useTransition();

  const toggle = (choice: OwnListChoice) =>
    startTransition(async () => {
      const adding = !choice.inList;
      const result = adding ? await addGameToListAction(choice.id, gameId) : await removeGameFromListAction(choice.id, gameId);
      if (!result.ok) {
        setMessage({ text: result.error ?? "That didn't save.", error: true });
        return;
      }
      const count = choice.count + (adding ? 1 : -1);
      setChoices((all) => all.map((c) => (c.id === choice.id ? { ...c, inList: adding, count, place: adding && c.ranked ? count : null } : c)));
      setJust(adding ? choice.id : null);
      setMessage({ text: adding ? `Added to ${choice.name}${choice.private ? " (Private)" : ""}${choice.ranked ? `, at the bottom: No. ${count}` : ""}.` : `Taken out of ${choice.name}.` });
      router.refresh();
    });

  return (
    <div className="mb-5 rounded-md bg-card px-4 py-4 shadow-[inset_0_0_0_1px_var(--color-highlight)] sm:px-4.5">
      <div className="font-label flex items-center gap-2.5 text-[0.8rem] font-bold tracking-[0.08em] text-dim-foreground">
        <ListPlus aria-hidden className="size-4" />
        <b className="text-foreground">Add to your lists</b>
        <Button variant="ghost" size="icon-xs" aria-label="Close Add to list" onClick={onClose} className="ml-auto">
          <X />
        </Button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 max-sm:flex-col max-sm:items-stretch">
        {choices.map((c) => (
          <Button
            key={c.id}
            variant={c.inList ? (just === c.id ? "highlight" : "selected") : "outline"}
            aria-pressed={c.inList}
            disabled={pending || (c.full && !c.inList)}
            onClick={() => toggle(c)}
            className="max-sm:justify-start"
          >
            {c.inList ? <Check aria-hidden /> : c.full ? <Ban aria-hidden /> : c.private ? <Lock aria-hidden /> : <Plus aria-hidden />}
            {c.name}
            <span className="font-bold opacity-70 max-sm:ml-auto">
              {c.full && !c.inList ? "500 full" : c.inList ? (just === c.id ? "Added" : c.place ? `No. ${c.place}` : "In") : c.count}
            </span>
          </Button>
        ))}
        <ButtonLink href={`/lists/new?game=${gameId}`} variant="add" className="max-sm:justify-start">
          <Plus aria-hidden />
          New list
        </ButtonLink>
      </div>
      <p role="status" className="mt-3 text-[0.9rem] text-dim-foreground">
        {message ? (
          <span className={message.error ? "text-destructive" : undefined}>{message.text}</span>
        ) : choices.length === 0 ? (
          `You have no Game Lists yet. Start one with ${gameTitle} in it.`
        ) : (
          `Tap a list to add ${gameTitle}. Lists it's already on are filled; tap one to take it out.`
        )}
      </p>
    </div>
  );
}
