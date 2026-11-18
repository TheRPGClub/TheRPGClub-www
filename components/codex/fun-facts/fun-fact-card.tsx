"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Pencil } from "lucide-react";
import type { CodexEntry } from "@/lib/codex/types";
import { funFactAnchor, LORE_PATH, storyOf } from "@/lib/codex/paths";
import { addedOn } from "@/lib/codex/wall";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FunFactText } from "@/components/codex/fun-fact-text";
import { FunFactDelete } from "./fun-fact-delete";
import { FunFactEdit } from "./fun-fact-edit";

// One Fun Fact on the wall (4D): an index card in the Fun Facts ink, taped
// up at its own tilt, ruled, numbered and dated, with its author, its story
// when it tells one, and Edit and Delete for whoever may. Editing turns the
// card over into the Fun Fact field, in place.
export function FunFactCard({
  fact,
  number,
  light,
  tilt,
  next,
}: {
  fact: CodexEntry;
  number: number;
  // Every third card is the pale pink.
  light: boolean;
  tilt: number;
  // The Fun Fact this member just added: it goes out next.
  next: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const story = storyOf(fact.links);
  const anchor = funFactAnchor(fact.id);

  if (editing) {
    return <FunFactEdit id={anchor} fact={fact} number={number} onDone={() => setEditing(false)} />;
  }

  return (
    <article
      id={anchor}
      style={{ "--tilt": `${tilt}deg` } as React.CSSProperties}
      className={cn(
        "relative flex min-h-40 scroll-mt-24 sm:min-h-[14.4rem] flex-col rounded-xs px-4.5 pt-5 pb-3.5 text-background shadow-[0_10px_22px_rgb(0_0_0/0.5)] [transform:rotate(calc(var(--tilt)/2))] sm:[transform:rotate(var(--tilt))] motion-safe:transition-transform motion-safe:duration-200 motion-safe:hover:[transform:rotate(0deg)_translateY(-3px)] motion-safe:sm:hover:[transform:rotate(0deg)_translateY(-3px)]",
        "bg-[repeating-linear-gradient(transparent_0_27px,rgb(11_11_13/0.13)_27px_28px)] bg-position-[0_46px]",
        light ? "bg-codex-fact-light" : "bg-codex-fact",
      )}
    >
      <i
        aria-hidden
        className="absolute -top-2.5 left-1/2 h-5.5 w-21 -translate-x-1/2 rotate-[calc(var(--tilt)*-1.6)] bg-foreground/70 shadow-[0_1px_3px_rgb(0_0_0/0.25)]"
      />
      <header className="mb-2 flex items-baseline justify-between gap-3 border-b-2 border-background pb-1.5">
        <h3 className="font-headline text-2xl leading-[0.9]">No. {number}</h3>
        <span className="font-label text-[0.75rem] font-bold tracking-[0.06em]">{addedOn(fact.created_at)}</span>
      </header>
      <p className="mb-3 text-[1.0625rem] leading-7 font-medium text-pretty [&_a]:decoration-background/55">
        <FunFactText body={fact.body ?? ""} mentions={fact.mentions} />
      </p>
      <footer className="font-label mt-auto flex flex-col items-start gap-1.5 text-[0.8125rem] font-bold tracking-[0.06em]">
        {next && (
          <span className="rounded-xs px-1.5 py-1 text-[0.72rem] font-bold tracking-[0.08em] shadow-[inset_0_0_0_1.5px_currentColor]">
            Next Daily Fun Fact
          </span>
        )}
        <span>by {fact.author.name}</span>
        {story && (
          <Link
            href={`${LORE_PATH}/${story.id}`}
            className="inline-flex items-center gap-1.5 rounded-xs bg-background px-2.5 py-1.5 text-foreground transition-colors hover:text-highlight"
          >
            <BookOpen aria-hidden className="size-3.5" />
            Read the story
          </Link>
        )}
        {(fact.viewer.can_edit || fact.viewer.can_delete) && (
          <span className="flex gap-3">
            {fact.viewer.can_edit && (
              <Button variant="inverse-link" size="inline" onClick={() => setEditing(true)} className="inline-flex items-center gap-1">
                <Pencil aria-hidden className="size-3.5" />
                Edit
              </Button>
            )}
            {fact.viewer.can_delete && <FunFactDelete id={fact.id} number={number} />}
          </span>
        )}
      </footer>
    </article>
  );
}
