"use client";

import { useId, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { reviewBodyText } from "@/lib/api/review-body";
import type { ReviewBody } from "@/lib/api/types";
import { editRuleDate } from "@/lib/reviews/edit-rules";
import { cn } from "@/lib/utils";
import { DeskNote } from "./desk-note";

// The take a Revision answers: the Review's current Published take.
export interface EarlierTake {
  rating: number | null;
  publishedAt: string | null;
  body: ReviewBody;
  title?: string | null;
}

// Taped above Overall while a Revision is written: the earlier take and its
// score, faded but readable, so the old 72 sits beside the new ruler. The
// opening shows; "Read all of it" unfolds the rest in place.
export function EarlierTakeNote({ take, track }: { take: EarlierTake; track: string | null }) {
  const [open, setOpen] = useState(false);
  const textId = useId();
  const text = reviewBodyText(take.body)?.trim() || take.title?.trim() || null;
  const paragraphs = text?.split(/\n+/).filter((p) => p.trim() !== "") ?? [];
  const long = paragraphs.length > 1 || (text?.length ?? 0) > 160;

  return (
    <DeskNote
      heading="Your take"
      aside={take.publishedAt ? editRuleDate(take.publishedAt) : null}
      className="opacity-92 lg:rotate-[0.8deg]"
    >
      <p className="m-0 flex items-baseline gap-2">
        <span className="font-headline text-[2.6rem] leading-[0.8] text-dim-foreground">
          {take.rating ?? "—"}
        </span>
        <span className="font-label text-[0.72rem] font-extrabold tracking-[0.08em] text-faint-foreground">
          / 100{track && ` · ${track}`}
        </span>
      </p>
      {text ? (
        <div
          id={textId}
          className={cn(
            "mt-2 mb-2.5 space-y-2 border-l border-border-strong pl-2.5 text-[0.95rem] leading-normal text-dim-foreground italic",
            !open && "line-clamp-3",
          )}
        >
          {(open ? paragraphs : paragraphs.slice(0, 1)).map((p, i) => (
            <p key={i} className="m-0">
              {p}
            </p>
          ))}
        </div>
      ) : (
        <p className="mt-2 mb-0 text-[0.9rem] text-faint-foreground italic">A score, nothing written.</p>
      )}
      {long && (
        <Button
          type="button"
          variant="ghost"
          size="xs"
          className="-ml-2"
          aria-expanded={open}
          aria-controls={textId}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "Fold it away" : "Read all of it"}
          {open ? <ArrowUp data-icon="inline-end" /> : <ArrowDown data-icon="inline-end" />}
        </Button>
      )}
    </DeskNote>
  );
}
