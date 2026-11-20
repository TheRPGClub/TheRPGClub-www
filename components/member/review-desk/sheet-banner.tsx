"use client";

import { useEditorRef } from "platejs/react";

import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { MAX_REVIEW_LENGTH } from "@/lib/api/review-body";
import { MAX_REVIEW_TITLE_LENGTH } from "@/lib/api/review-title";
import { cn } from "@/lib/utils";
import { deskPill, type ReviewDeskGame } from "./desk-game";

// The head of the review's sheet: the game's key art across it under the
// site's ink scrim (darkened from the foot, where the title sits, and a little
// from the top, where the game's name sits), the game and its pill, the
// character count, and the review's title written in place in Anton. A game
// with no art keeps the same lines on a plain ink-3 band.
export function SheetBanner({
  game,
  title,
  onTitle,
  count,
  disabled,
}: {
  game?: ReviewDeskGame;
  title: string;
  onTitle: (title: string) => void;
  count: number;
  disabled?: boolean;
}) {
  const editor = useEditorRef();
  const art = game?.art_url ?? game?.cover_url;
  const pill = game ? deskPill(game) : null;

  return (
    <div
      className={cn(
        "relative isolate flex flex-col justify-between gap-10 overflow-hidden px-4 pt-4 sm:px-10",
        art ? "min-h-56 sm:min-h-[17rem]" : "bg-muted",
      )}
    >
      {art && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- the game's key art from its own address, set as a CSS-sized backdrop like the review banner's */}
          <img src={art} alt="" className="absolute inset-0 -z-20 size-full object-cover object-[center_30%]" />
          <span
            aria-hidden
            className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-background)_75%,transparent)_0%,transparent_28%),linear-gradient(0deg,color-mix(in_oklab,var(--color-background)_97%,transparent)_8%,color-mix(in_oklab,var(--color-background)_55%,transparent)_45%,color-mix(in_oklab,var(--color-background)_20%,transparent)_100%)]"
          />
        </>
      )}
      <div className="flex items-center gap-2.5 border-b border-foreground/25 pb-2.5 [text-shadow:0_1px_8px_rgb(0_0_0/0.85)]">
        {game && (
          <span className="font-label truncate text-[0.78rem] font-extrabold tracking-[0.08em]">{game.title}</span>
        )}
        {pill && (
          <Badge tone={pill.tone} className="shrink-0">
            {pill.label}
          </Badge>
        )}
        <span className="font-label ml-auto shrink-0 text-[0.75rem] font-bold tracking-[0.08em] text-dim-foreground">
          <span className="text-foreground">{count.toLocaleString("en-GB")}</span> / {MAX_REVIEW_LENGTH.toLocaleString("en-GB")}
        </span>
      </div>
      <Textarea
        variant="headline"
        rows={1}
        value={title}
        maxLength={MAX_REVIEW_TITLE_LENGTH}
        disabled={disabled}
        aria-label="Review title"
        placeholder="Title your review"
        onChange={(e) => onTitle(e.currentTarget.value.replace(/\n/g, " "))}
        onKeyDown={(e) => {
          // A title is one line: Enter moves on to the story.
          if (e.key !== "Enter") return;
          e.preventDefault();
          editor.tf.focus({ edge: "start" });
        }}
        className="font-headline field-sizing-content min-h-0 resize-none border-x-0 border-t-0 border-b-2 px-0 pt-1 pb-2 text-[2.5rem] leading-[0.95] uppercase sm:text-[3.4rem] md:text-[3.4rem]"
      />
    </div>
  );
}
